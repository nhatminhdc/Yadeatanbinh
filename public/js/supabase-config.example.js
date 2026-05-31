// Không dùng file này trên Vercel — key lấy từ Environment Variables.
// Local: dùng .env hoặc data/supabase.json (xem .env.example)
window.SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
  table: 'leads',
};
