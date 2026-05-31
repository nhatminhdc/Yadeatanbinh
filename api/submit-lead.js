const { parseBody, sendJson } = require('../lib/http');
const { formatLeadTelegramMessage, sendTelegramMessage } = require('../lib/telegram');
const { checkLeadSubmittedToday, insertLeadToSupabase } = require('../lib/leads');
const { isValidVnPhone } = require('../lib/phone');
const { isRateLimited } = require('../lib/rate-limit');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (isRateLimited(req)) {
    sendJson(res, 429, { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', code: 'RATE_LIMIT' });
    return;
  }

  try {
    const body = await parseBody(req);

    if (body.website || body._hp) {
      sendJson(res, 200, { success: true });
      return;
    }

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const product_id = String(body.product_id || '').trim();
    const product_name = String(body.product_name || '').trim();
    const product_price = body.product_price;
    const product_price_label = String(body.product_price_label || '').trim();
    const note = String(body.note || '').trim();

    if (!name || !phone) {
      sendJson(res, 400, { error: 'Thiếu họ tên hoặc số điện thoại' });
      return;
    }

    if (!isValidVnPhone(phone)) {
      sendJson(res, 400, { error: 'Số điện thoại không hợp lệ' });
      return;
    }

    const alreadySubmitted = await checkLeadSubmittedToday(phone);
    if (alreadySubmitted) {
      sendJson(res, 429, {
        error: 'Số điện thoại này đã gửi đơn hàng hôm nay. Vui lòng thử lại vào ngày mai hoặc gọi hotline 0933 969396.',
        code: 'DUPLICATE_PHONE',
      });
      return;
    }

    const lead = {
      name,
      phone,
      product_id: product_id || undefined,
      product_name,
      product_price: product_price || undefined,
      note,
      source: body.source || 'quick_order',
    };

    const results = await Promise.allSettled([
      insertLeadToSupabase(lead),
      sendTelegramMessage(formatLeadTelegramMessage({
        name,
        phone,
        product_name,
        product_price,
        product_price_label,
        note,
      })),
    ]);

    const supabaseOk = results[0].status === 'fulfilled';
    const telegramOk = results[1].status === 'fulfilled';

    if (!supabaseOk && !telegramOk) {
      sendJson(res, 500, {
        error: 'Không gửi được đơn hàng',
        supabase: results[0].reason?.message,
        telegram: results[1].reason?.message,
      });
      return;
    }

    sendJson(res, 200, {
      success: true,
      supabase: supabaseOk,
      telegram: telegramOk,
    });
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Gửi đơn hàng thất bại' });
  }
};
