const https = require('https');
const { getTelegramConfig } = require('./env');

function escapeTelegramHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPriceVnd(price) {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) return '—';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

function formatLeadTelegramMessage(lead) {
  const priceText = lead.product_price_label || formatPriceVnd(lead.product_price);

  return [
    '🛵 <b>ĐẶT HÀNG MỚI - Yadea Tân Bình</b>',
    '',
    `• <b>Tên khách hàng:</b> ${escapeTelegramHtml(lead.name)}`,
    `• <b>Số điện thoại:</b> ${escapeTelegramHtml(lead.phone)}`,
    `• <b>Dòng Xe Muốn Mua:</b> ${escapeTelegramHtml(lead.product_name || '—')}`,
    `• <b>Giá xe:</b> ${escapeTelegramHtml(priceText)}`,
    `• <b>Ghi chú:</b> ${escapeTelegramHtml(lead.note || '—')}`,
  ].join('\n');
}

function sendTelegramMessage(text) {
  const cfg = getTelegramConfig();
  if (!cfg) return Promise.reject(new Error('Chưa cấu hình Telegram'));

  const payload = JSON.stringify({
    chat_id: cfg.chatId,
    text,
    parse_mode: 'HTML',
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${cfg.botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(data || `Telegram HTTP ${res.statusCode}`));
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { formatLeadTelegramMessage, sendTelegramMessage };
