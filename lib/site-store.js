const fs = require('fs');
const path = require('path');
const { getSupabaseServiceConfig } = require('./env');

const DATA_FILE = path.join(__dirname, '..', 'data', 'site.json');
const CONFIG_ID = 'main';

function readDataFromFile() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDataToFile(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function supabaseHeaders(cfg, extra = {}) {
  return {
    apikey: cfg.serviceRoleKey,
    Authorization: `Bearer ${cfg.serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function useSupabaseStore() {
  const cfg = getSupabaseServiceConfig();
  return !!(cfg?.url && cfg?.serviceRoleKey);
}

async function readFromSupabase(cfg) {
  const baseUrl = cfg.url.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/rest/v1/site_config?id=eq.${CONFIG_ID}&select=data`, {
    headers: supabaseHeaders(cfg),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase read failed (${res.status}): ${err.slice(0, 200)}`);
  }

  const rows = await res.json();
  if (rows?.[0]?.data) return rows[0].data;

  const seed = readDataFromFile();
  await writeToSupabase(cfg, seed);
  return seed;
}

async function writeToSupabase(cfg, data) {
  const baseUrl = cfg.url.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/rest/v1/site_config?on_conflict=id`, {
    method: 'POST',
    headers: supabaseHeaders(cfg, { Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify({
      id: CONFIG_ID,
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase write failed (${res.status}): ${err.slice(0, 200)}`);
  }
}

async function readData() {
  const cfg = getSupabaseServiceConfig();
  if (cfg?.url && cfg?.serviceRoleKey) {
    return readFromSupabase(cfg);
  }
  return readDataFromFile();
}

async function writeData(data) {
  const cfg = getSupabaseServiceConfig();
  if (cfg?.url && cfg?.serviceRoleKey) {
    await writeToSupabase(cfg, data);
    return;
  }
  if (process.env.VERCEL === '1') {
    throw new Error('Chưa cấu hình SUPABASE_SERVICE_ROLE_KEY trên Vercel. Admin không thể lưu dữ liệu.');
  }
  writeDataToFile(data);
}

function readDataSync() {
  return readDataFromFile();
}

function writeDataSync(data) {
  writeDataToFile(data);
}

module.exports = {
  DATA_FILE,
  useSupabaseStore,
  readData,
  writeData,
  readDataSync,
  writeDataSync,
  readDataFromFile,
  writeDataToFile,
};
