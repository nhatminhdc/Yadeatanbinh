const HOTLINE_DISPLAY = '0933 96 93 96';

function normalizePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('84')) digits = `0${digits.slice(2)}`;
  if (digits.length === 9 && digits.startsWith('9')) digits = `0${digits}`;
  return digits;
}

function formatHotlineDisplay(phone) {
  const digits = normalizePhone(phone);
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
  }
  const trimmed = String(phone || '').trim();
  return trimmed || HOTLINE_DISPLAY;
}

function isValidVnPhone(phone) {
  const normalized = normalizePhone(phone);
  return /^0(3|5|7|8|9)\d{8}$/.test(normalized);
}

module.exports = { normalizePhone, formatHotlineDisplay, isValidVnPhone, HOTLINE_DISPLAY };
