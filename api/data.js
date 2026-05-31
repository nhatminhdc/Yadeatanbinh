const { readPublicData } = require('../lib/site-data');
const { sendJson } = require('../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    sendJson(res, 200, readPublicData(), true);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Không đọc được dữ liệu' });
  }
};
