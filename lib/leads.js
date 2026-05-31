const { getSupabaseConfig } = require('./env');
const { normalizePhone } = require('./phone');

function supabaseHeaders(cfg, extra = {}) {
  return {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function checkLeadSubmittedToday(phone) {
  const cfg = getSupabaseConfig();
  if (!cfg?.url || !cfg?.anonKey) return false;

  try {
    const baseUrl = cfg.url.replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/rest/v1/rpc/check_lead_today`, {
      method: 'POST',
      headers: supabaseHeaders(cfg),
      body: JSON.stringify({ input_phone: phone }),
    });

    if (res.ok) {
      const exists = await res.json();
      return exists === true;
    }

    if (res.status === 404) {
      return checkLeadSubmittedTodayFallback(phone, cfg);
    }

    return false;
  } catch {
    return false;
  }
}

async function checkLeadSubmittedTodayFallback(phone, cfg) {
  const normalized = normalizePhone(phone);
  const startOfDay = getVietnamDayStartIso();
  const baseUrl = cfg.url.replace(/\/$/, '');
  const table = cfg.table || 'leads';
  const query = new URLSearchParams({
    select: 'phone',
    phone: `eq.${normalized}`,
    created_at: `gte.${startOfDay}`,
    limit: '1',
  });

  const res = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders(cfg),
  });

  if (!res.ok) return false;

  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

function getVietnamDayStartIso() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const y = parts.find(p => p.type === 'year').value;
  const m = parts.find(p => p.type === 'month').value;
  const d = parts.find(p => p.type === 'day').value;
  return `${y}-${m}-${d}T00:00:00+07:00`;
}

async function insertLeadToSupabase(lead) {
  const cfg = getSupabaseConfig();
  if (!cfg?.url || !cfg?.anonKey) {
    throw new Error('Chưa cấu hình Supabase');
  }

  const baseUrl = cfg.url.replace(/\/$/, '');
  const table = cfg.table || 'leads';
  const payload = {
    ...lead,
    phone: normalizePhone(lead.phone),
  };

  const res = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: supabaseHeaders(cfg, { Prefer: 'return=minimal' }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(detail || `Supabase HTTP ${res.status}`);
  }
}

module.exports = {
  checkLeadSubmittedToday,
  insertLeadToSupabase,
  getVietnamDayStartIso,
};
