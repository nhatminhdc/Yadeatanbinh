#!/usr/bin/env bash
# Thiết lập Environment Variables trên Vercel (chạy 1 lần sau khi cài Vercel CLI: npm i -g vercel)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Cài Vercel CLI: npm install -g vercel"
  echo "Sau đó: vercel login && vercel link"
  exit 1
fi

read_cfg() {
  node -e "
    const fs = require('fs');
    const p = process.argv[1];
    if (!fs.existsSync(p)) { console.error('Missing', p); process.exit(1); }
    console.log(JSON.stringify(JSON.parse(fs.readFileSync(p,'utf8'))));
  " "$1"
}

SUPABASE=$(read_cfg "$ROOT/data/supabase.json")
TELEGRAM=$(read_cfg "$ROOT/data/telegram.json")

SUPABASE_URL=$(node -e "console.log(JSON.parse(process.argv[1]).url)" "$SUPABASE")
SUPABASE_ANON_KEY=$(node -e "console.log(JSON.parse(process.argv[1]).anonKey)" "$SUPABASE")
SUPABASE_TABLE=$(node -e "console.log(JSON.parse(process.argv[1]).table || 'leads')" "$SUPABASE")
TELEGRAM_BOT_TOKEN=$(node -e "console.log(JSON.parse(process.argv[1]).botToken)" "$TELEGRAM")
TELEGRAM_CHAT_ID=$(node -e "console.log(JSON.parse(process.argv[1]).chatId)" "$TELEGRAM")

ENVIRONMENTS="production preview development"

add_env() {
  local key="$1"
  local val="$2"
  for env in $ENVIRONMENTS; do
    printf '%s' "$val" | vercel env add "$key" "$env" --force 2>/dev/null || \
      printf '%s' "$val" | vercel env add "$key" "$env"
  done
  echo "✓ $key"
}

echo "Đang set env vars cho project Vercel (yadeatanbinh)..."
add_env SUPABASE_URL "$SUPABASE_URL"
add_env SUPABASE_ANON_KEY "$SUPABASE_ANON_KEY"
add_env SUPABASE_TABLE "$SUPABASE_TABLE"
add_env TELEGRAM_BOT_TOKEN "$TELEGRAM_BOT_TOKEN"
add_env TELEGRAM_CHAT_ID "$TELEGRAM_CHAT_ID"

if [ -z "${SESSION_SECRET:-}" ]; then
  SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
fi
add_env SESSION_SECRET "$SESSION_SECRET"

echo ""
echo "⚠️  Thêm thủ công trên Vercel Dashboard:"
echo "   SUPABASE_SERVICE_ROLE_KEY  (Supabase → Settings → API → service_role)"
echo ""
echo "Supabase SQL (chạy 1 lần):"
echo "   scripts/supabase-site-config-setup.sql"
echo "Seed dữ liệu (local, sau khi có service role key):"
echo "   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-site-config.js"
echo ""
echo "Xong. Redeploy: vercel --prod"
echo "Hoặc Vercel Dashboard → Deployments → Redeploy"
