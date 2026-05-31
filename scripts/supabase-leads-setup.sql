-- Chạy trong Supabase: SQL Editor (nếu chưa có bảng hoặc cần bật quyền ghi)
-- Cột khớp với form "Đặt hàng nhanh" trong public/js/app.js

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  product_id text,
  product_name text,
  product_price bigint,
  note text,
  source text default 'quick_order',
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous insert leads" on public.leads;
create policy "Allow anonymous insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

grant insert on public.leads to anon;
