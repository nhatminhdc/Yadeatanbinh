# Yadea Tân Bình

Website xe điện Yadea chính hãng tại Tân Bình, TP.HCM.

## Chạy website (local)

```bash
node server.js
```

Mở: **http://localhost:3000**

## Admin

### Trên production (yadeatanbinh.vn)

Admin chạy trực tiếp tại **https://yadeatanbinh.vn/admin/**

**Cấu hình Vercel (bắt buộc):**

| Biến | Mô tả |
|------|--------|
| `SESSION_SECRET` | Chuỗi ngẫu nhiên ≥32 ký tự (cookie đăng nhập) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key từ Supabase (lưu dữ liệu admin) |
| `SUPABASE_URL` | URL project Supabase |

**Supabase (chạy 1 lần):**

1. SQL Editor → chạy `scripts/supabase-leads-setup.sql`
2. SQL Editor → chạy `scripts/supabase-site-config-setup.sql`
3. Seed dữ liệu: `node scripts/seed-site-config.js` (cần service role key trong env)

Ảnh upload mới được lưu vào **Supabase Storage** (bucket `uploads`).

### Local

- URL: **http://localhost:3000/admin/**
- Đăng nhập mặc định: `admin` / `admin`
- Dữ liệu lưu vào `data/site.json` (không cần Supabase)
