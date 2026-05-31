const { getSupabaseConfig } = require('../lib/env');
const { sendJson } = require('../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const cfg = getSupabaseConfig();
  if (!cfg) {
    sendJson(res, 503, { error: 'Chưa cấu hình Supabase' });
    return;
  }

  sendJson(res, 200, cfg, true);
};
