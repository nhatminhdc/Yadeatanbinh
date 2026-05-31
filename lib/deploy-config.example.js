// Chỉ dùng local — copy từ .env hoặc data/*.json (gitignored).
// Trên Vercel: đặt Environment Variables, không commit secret.
module.exports = {
  supabase: null,
  telegram: null,
};
