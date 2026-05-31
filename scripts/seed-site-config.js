#!/usr/bin/env node
/**
 * Đẩy data/site.json lên Supabase site_config (chạy 1 lần trước khi dùng admin trên Vercel)
 * Cần: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY trong env hoặc data/supabase.json
 */
const { readDataFromFile } = require('../lib/site-store');
const { getSupabaseServiceConfig } = require('../lib/env');

async function main() {
  const cfg = getSupabaseServiceConfig();
  if (!cfg?.url || !cfg?.serviceRoleKey) {
    console.error('❌ Thiếu SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const data = readDataFromFile();
  const baseUrl = cfg.url.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/rest/v1/site_config?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      id: 'main',
      data,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    console.error('❌ Seed thất bại:', res.status, await res.text());
    process.exit(1);
  }

  console.log('✅ Đã seed site_config lên Supabase');
  console.log(`   Sản phẩm: ${data.products?.length || 0}`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
