const { readProductBySlug } = require('../../lib/site-data');
const { sendJson } = require('../../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const slug = req.query?.slug;
  if (!slug) {
    sendJson(res, 400, { error: 'Thiếu slug sản phẩm' });
    return;
  }

  try {
    const product = readProductBySlug(slug);
    if (!product) {
      sendJson(res, 404, { error: 'Không tìm thấy sản phẩm' });
      return;
    }
    sendJson(res, 200, product, true);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Không đọc được sản phẩm' });
  }
};
