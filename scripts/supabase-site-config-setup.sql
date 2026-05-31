-- Chạy trong Supabase: SQL Editor (sau supabase-leads-setup.sql)
-- Lưu trữ cấu hình website cho admin trên Vercel

create table if not exists public.site_config (
  id text primary key default 'main',
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table public.site_config enable row level security;

-- Không mở quyền anon/authenticated — chỉ service_role truy cập (bypass RLS)

-- Bucket lưu ảnh upload từ admin
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

-- Cho phép đọc ảnh công khai
drop policy if exists "Public read uploads" on storage.objects;
create policy "Public read uploads"
  on storage.objects for select
  using (bucket_id = 'uploads');
