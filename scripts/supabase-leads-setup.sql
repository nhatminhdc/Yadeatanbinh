-- Chạy trong Supabase: SQL Editor

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

-- Bổ sung cột nếu bảng đã tạo trước đó thiếu
alter table public.leads add column if not exists id uuid default gen_random_uuid();
alter table public.leads add column if not exists product_id text;
alter table public.leads add column if not exists product_name text;
alter table public.leads add column if not exists product_price bigint;
alter table public.leads add column if not exists note text;
alter table public.leads add column if not exists source text default 'quick_order';
alter table public.leads add column if not exists created_at timestamptz default now();

alter table public.leads enable row level security;

drop policy if exists "Allow anonymous insert leads" on public.leads;
create policy "Allow anonymous insert leads"
  on public.leads for insert to anon with check (true);

grant insert on public.leads to anon;

-- Kiểm tra trùng SĐT: 1 lần/ngày (giờ Việt Nam) — không lộ dữ liệu qua SELECT
create or replace function public.check_lead_today(input_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
begin
  normalized := regexp_replace(coalesce(input_phone, ''), '[^0-9]', '', 'g');
  if normalized like '84%' then
    normalized := '0' || substring(normalized from 3);
  end if;
  if length(normalized) = 9 and normalized like '9%' then
    normalized := '0' || normalized;
  end if;

  return exists (
    select 1 from public.leads l
    where regexp_replace(coalesce(l.phone, ''), '[^0-9]', '', 'g') = normalized
      and l.created_at >= date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh')
  );
end;
$$;

revoke all on function public.check_lead_today(text) from public;
grant execute on function public.check_lead_today(text) to anon;

-- Gỡ policy SELECT cũ nếu đã tạo (bảo mật hơn)
drop policy if exists "Allow anon check duplicate phone today" on public.leads;
