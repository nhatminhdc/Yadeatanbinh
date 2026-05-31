const { parseBody, sendJson } = require('./http');
const { readData, writeData } = require('./site-data');
const { getSession, setSessionCookie, clearSessionCookie } = require('./session');
const { saveUploadedImage } = require('./uploads');
const {
  findUserByCredentials,
  publicUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getUsers,
} = require('./admin-auth');

function sendJSON(res, status, data, cache = false) {
  sendJson(res, status, data, cache);
}

function requireSession(req, res, adminOnly = false) {
  const session = getSession(req);
  if (!session) {
    sendJSON(res, 401, { error: 'Unauthorized' });
    return null;
  }
  if (adminOnly && session.role !== 'admin') {
    sendJSON(res, 403, { error: 'Chỉ quản trị viên mới có quyền này' });
    return null;
  }
  return session;
}

async function handleApiRequest(req, res, pathname) {
  if (pathname === '/api/data' && req.method === 'GET') {
    const { readSiteMeta } = require('./site-data');
    sendJSON(res, 200, await readSiteMeta(), true);
    return;
  }

  if (pathname === '/api/products' && req.method === 'GET') {
    const { readProductList } = require('./site-data');
    sendJSON(res, 200, await readProductList(), true);
    return;
  }

  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (productMatch && req.method === 'GET') {
    const { readProductBySlug } = require('./site-data');
    const product = await readProductBySlug(decodeURIComponent(productMatch[1]));
    if (!product) {
      sendJSON(res, 404, { error: 'Không tìm thấy sản phẩm' });
      return;
    }
    sendJSON(res, 200, product, true);
    return;
  }

  if (pathname === '/api/submit-lead' && req.method === 'POST') {
    const submitLead = require('../api/submit-lead');
    await submitLead(req, res);
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const { username, password } = await parseBody(req);
      const user = await findUserByCredentials(username, password);
      if (user) {
        setSessionCookie(res, user);
        sendJSON(res, 200, { success: true, user: publicUser(user) });
      } else {
        sendJSON(res, 401, { error: 'Sai tên đăng nhập hoặc mật khẩu' });
      }
    } catch {
      sendJSON(res, 400, { error: 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    clearSessionCookie(res);
    sendJSON(res, 200, { success: true });
    return;
  }

  if (pathname === '/api/auth/check' && req.method === 'GET') {
    const session = getSession(req);
    sendJSON(res, 200, {
      authenticated: !!session,
      user: session ? {
        id: session.userId,
        username: session.username,
        role: session.role,
        name: session.name,
      } : null,
    });
    return;
  }

  const session = requireSession(req, res);
  if (!session) return;

  if (pathname === '/api/admin/data' && req.method === 'GET') {
    sendJSON(res, 200, await readData());
    return;
  }

  if (pathname === '/api/admin/data' && req.method === 'PUT') {
    try {
      const body = await parseBody(req);
      const current = await readData();
      const updated = { ...body, admin: current.admin };
      await writeData(updated);
      sendJSON(res, 200, { success: true });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/admin/password' && req.method === 'PUT') {
    try {
      const { currentPassword, newPassword } = await parseBody(req);
      await changePassword(session.userId, currentPassword, newPassword);
      sendJSON(res, 200, { success: true });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Dữ liệu không hợp lệ' });
    }
    return;
  }

  if (pathname === '/api/admin/users' && req.method === 'GET') {
    if (!requireSession(req, res, true)) return;
    sendJSON(res, 200, (await getUsers()).map(publicUser));
    return;
  }

  if (pathname === '/api/admin/users' && req.method === 'POST') {
    if (!requireSession(req, res, true)) return;
    try {
      const body = await parseBody(req);
      const user = await createUser(body);
      sendJSON(res, 200, { success: true, user });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Không tạo được tài khoản' });
    }
    return;
  }

  const userMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userMatch && req.method === 'PUT') {
    if (!requireSession(req, res, true)) return;
    try {
      const body = await parseBody(req);
      const user = await updateUser(decodeURIComponent(userMatch[1]), body);
      sendJSON(res, 200, { success: true, user });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Không cập nhật được tài khoản' });
    }
    return;
  }

  if (userMatch && req.method === 'DELETE') {
    if (!requireSession(req, res, true)) return;
    try {
      await deleteUser(decodeURIComponent(userMatch[1]));
      sendJSON(res, 200, { success: true });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Không xóa được tài khoản' });
    }
    return;
  }

  if (pathname === '/api/admin/upload' && req.method === 'POST') {
    try {
      const { data, filename } = await parseBody(req);
      const url = await saveUploadedImage(data, filename);
      sendJSON(res, 200, { url });
    } catch (err) {
      sendJSON(res, 400, { error: err.message || 'Upload thất bại' });
    }
    return;
  }

  if (pathname === '/api/admin/sync-status' && req.method === 'GET') {
    const data = await readData();
    sendJSON(res, 200, data.syncStatus || { status: 'idle', message: 'Chưa cập nhật giá' });
    return;
  }

  if (pathname === '/api/admin/sync-products' && req.method === 'POST') {
    try {
      const { syncProducts } = require('../scripts/sync-products');
      const result = await syncProducts();
      const data = await readData();
      sendJSON(res, 200, {
        success: true,
        count: result.count,
        updated: result.updated,
        added: result.added,
        syncStatus: data.syncStatus,
      });
    } catch (err) {
      const data = await readData();
      sendJSON(res, 500, {
        error: err.message || 'Đồng bộ thất bại',
        syncStatus: data.syncStatus,
      });
    }
    return;
  }

  sendJSON(res, 404, { error: 'Not Found' });
}

module.exports = { handleApiRequest, requireSession, getSession };
