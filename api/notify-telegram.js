const { parseBody, sendJson } = require('../lib/http');
const { formatLeadTelegramMessage, sendTelegramMessage } = require('../lib/telegram');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await parseBody(req);
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const product_name = String(body.product_name || '').trim();
    const product_price = body.product_price;
    const product_price_label = String(body.product_price_label || '').trim();
    const note = String(body.note || '').trim();

    if (!name || !phone) {
      sendJson(res, 400, { error: 'Thiếu họ tên hoặc số điện thoại' });
      return;
    }

    await sendTelegramMessage(formatLeadTelegramMessage({
      name,
      phone,
      product_name,
      product_price,
      product_price_label,
      note,
    }));

    sendJson(res, 200, { success: true });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Gửi Telegram thất bại' });
  }
};
