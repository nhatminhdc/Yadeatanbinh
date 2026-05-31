const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { handleApiRequest } = require('./lib/api-handler');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, pathname);
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
