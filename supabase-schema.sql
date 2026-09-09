-- ============================================================
-- HAVEN Archive — Supabase schema + RLS
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Tables
create table if not exists resorts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text not null,
  contact text,
  rate_12h text,
  rate_22h text,
  pax text,
  add_pax_rate text,
  rooms text,
  pool text,
  inclusions text[] default '{}',
  amenities text[] default '{}',
  gallery text[] default '{}',
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists allowed_users (
  email text primary key,
  role text not null default 'viewer' check (role in ('viewer','admin')),
  added_at timestamptz default now()
);

-- 2. RLS helper functions
create or replace function is_allowed_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from allowed_users where email = auth.jwt() ->> 'email'
  );
$$;

create or replace function is_admin_user()
returns boolean language sql stable as $$
  select exists (
    select 1 from allowed_users
    where email = auth.jwt() ->> 'email' and role = 'admin'
  );
$$;

-- 3. Enable RLS
alter table resorts enable row level security;
alter table allowed_users enable row level security;

-- 4. Policies — resorts
create policy "allowed users can read resorts"
  on resorts for select using (is_allowed_user());

create policy "admins can insert resorts"
  on resorts for insert with check (is_admin_user());

create policy "admins can update resorts"
  on resorts for update using (is_admin_user());

create policy "admins can delete resorts"
  on resorts for delete using (is_admin_user());

-- 5. Policies — allowed_users
create policy "admins can read allowed_users"
  on allowed_users for select using (is_admin_user());

create policy "admins can manage allowed_users"
  on allowed_users for all using (is_admin_user()) with check (is_admin_user());

-- 6. Storage bucket (create manually in Dashboard → Storage → New bucket)
-- Name: resort-photos
-- Public: OFF (private)
-- Then add these storage policies via SQL:
--
-- create policy "Allowed users can view resort photos"
--   on storage.objects for select
--   using ( bucket_id = 'resort-photos' and is_allowed_user() );
--
-- create policy "Admins can upload resort photos"
--   on storage.objects for insert
--   with check ( bucket_id = 'resort-photos' and is_admin_user() );
--
-- create policy "Admins can update resort photos"
--   on storage.objects for update
--   using ( bucket_id = 'resort-photos' and is_admin_user() );
--
-- create policy "Admins can delete resort photos"
--   on storage.objects for delete
--   using ( bucket_id = 'resort-photos' and is_admin_user() );
