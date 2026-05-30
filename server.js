const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const { syncProducts } = require('./scripts/sync-products');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'site.json');
const UPLOAD_DIR = path.join(ROOT, 'public', 'uploads');
const SESSIONS = new Map();
const SESSION_TTL = 24 * 60 * 60 * 1000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getSession(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  const session = SESSIONS.get(match[1]);
  if (!session || Date.now() > session.expires) {
    SESSIONS.delete(match[1]);
    return null;
  }
  return session;
}

function createSession(res) {
  const id = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(id, { expires: Date.now() + SESSION_TTL });
  res.setHeader('Set-Cookie', `session=${id}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_TTL / 1000}`);
  return id;
}

function sendJSON(res, status, data, cache = false) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cache ? 'public, max-age=60, stale-while-revalidate=300' : 'no-store',
  });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(404);
    res.end('Not Found');
  });
  res.writeHead(200, {
    'Content-Type': mime,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400, immutable',
  });
  stream.pipe(res);
}

async function handleAPI(req, res, pathname) {
  if (pathname === '/api/data' && req.method === 'GET') {
    const data = readData();
    const { admin, ...publicData } = data;
    sendJSON(res, 200, publicData, true);
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      const data = readData();
      if (username === data.admin.username && sha256(password) === data.admin.passwordHash) {
        createSession(res);
        sendJSON(res, 200, { success: true });
      } else {
        sendJSON(res, 401, { error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
    } catch {
      sendJSON(res, 400, { error: 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);
    if (match) SESSIONS.delete(match[1]);
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
    sendJSON(res, 200, { success: true });
    return;
  }

  if (pathname === '/api/auth/check' && req.method === 'GET') {
    sendJSON(res, 200, { authenticated: !!getSession(req) });
    return;
  }

  const session = getSession(req);
  if (!session) {
    sendJSON(res, 401, { error: 'Unauthorized' });
    return;
  }

  if (pathname === '/api/admin/data' && req.method === 'GET') {
    sendJSON(res, 200, readData());
    return;
  }

  if (pathname === '/api/admin/data' && req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      const current = readData();
      const updated = { ...body, admin: current.admin };
      writeData(updated);
      sendJSON(res, 200, { success: true });
    } catch {
      sendJSON(res, 400, { error: 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/admin/password' && req.method === 'PUT') {
    try {
      const { currentPassword, newPassword } = await parseBody(req);
      const data = readData();
      if (sha256(currentPassword) !== data.admin.passwordHash) {
        sendJSON(res, 401, { error: 'Mật khẩu hiện tại không đúng' });
        return;
      }
      data.admin.passwordHash = sha256(newPassword);
      writeData(data);
      sendJSON(res, 200, { success: true });
    } catch {
      sendJSON(res, 400, { error: 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/admin/upload' && req.method === 'POST') {
    try {
      const { data, filename } = await parseBody(req);
      if (!data || !filename) {
        sendJSON(res, 400, { error: 'Thiếu dữ liệu ảnh' });
        return;
      }
      const match = data.match(/^data:(image\/\w+);base64,(.+)$/);
      const ext = match ? (match[1].includes('png') ? '.png' : match[1].includes('webp') ? '.webp' : '.jpg') : path.extname(filename) || '.jpg';
      const buffer = Buffer.from(match ? match[2] : data, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        sendJSON(res, 400, { error: 'Ảnh tối đa 5MB' });
        return;
      }
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
      fs.writeFileSync(path.join(UPLOAD_DIR, safeName), buffer);
      sendJSON(res, 200, { url: `/uploads/${safeName}` });
    } catch {
      sendJSON(res, 400, { error: 'Upload thất bại' });
    }
    return;
  }

  if (pathname === '/api/admin/sync-products' && req.method === 'POST') {
    try {
      const count = await syncProducts();
      sendJSON(res, 200, { success: true, count });
    } catch (err) {
      sendJSON(res, 500, { error: err.message || 'Đồng bộ thất bại' });
    }
    return;
  }

  sendJSON(res, 404, { error: 'Not Found' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (pathname.startsWith('/api/')) {
    await handleAPI(req, res, pathname);
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.join(ROOT, 'public', pathname);

  if (!filePath.startsWith(path.join(ROOT, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(res, filePath);
    return;
  }

  const htmlPath = path.join(ROOT, 'public', 'index.html');
  if (fs.existsSync(htmlPath)) {
    sendFile(res, htmlPath);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n  🛵 Yadea Tân Bình đang chạy tại http://localhost:${PORT}`);
  console.log(`  📋 Admin: http://localhost:${PORT}/admin/`);
  console.log(`  🔑 Đăng nhập: admin / admin\n`);
});
