-- ============================================================
-- Gadget Malawi — Initial Schema
-- Safe to run multiple times (idempotent).
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_type as enum ('individual', 'shop');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_condition as enum ('new', 'like-new', 'used');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('draft', 'active', 'sold', 'paused', 'archived');
exception when duplicate_object then null; end $$;

-- ============================================================
-- LOCATIONS
-- ============================================================
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  region text,
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text,
  is_active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type user_type not null default 'individual',
  display_name text not null default '',
  username text unique,
  phone text,
  location_id uuid references public.locations(id) on delete set null,
  avatar_url text,
  bio text,
  shop_name text,
  shop_address text,
  shop_verified boolean not null default false,
  verified_at timestamptz,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_user_type_idx on public.profiles (user_type);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  title text not null,
  subtitle text,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'MWK',
  condition product_condition not null default 'used',
  specs jsonb not null default '{}'::jsonb,
  status product_status not null default 'draft',
  primary_image_url text,
  image_urls jsonb not null default '[]'::jsonb,
  views_count int not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_seller_id_idx on public.products (seller_id);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_location_id_idx on public.products (location_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_specs_gin on public.products using gin (specs);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

-- ---- PROFILES ----
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---- LOCATIONS ----
drop policy if exists "Locations are publicly readable" on public.locations;
create policy "Locations are publicly readable"
  on public.locations for select
  using (true);

-- ---- CATEGORIES ----
drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

-- ---- PRODUCTS ----
drop policy if exists "Active products are publicly readable" on public.products;
create policy "Active products are publicly readable"
  on public.products for select
  using (status = 'active' or auth.uid() = seller_id);

drop policy if exists "Sellers can insert own products" on public.products;
create policy "Sellers can insert own products"
  on public.products for insert
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can update own products" on public.products;
create policy "Sellers can update own products"
  on public.products for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "Sellers can delete own products" on public.products;
create policy "Sellers can delete own products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.categories (name, slug, icon, sort_order) values
  ('Phones', 'phones', 'mobile-screen', 10),
  ('Laptops', 'laptops', 'laptop', 20),
  ('PC Parts', 'pc-parts', 'microchip', 30),
  ('Storage', 'storage', 'hard-drive', 40),
  ('Accessories', 'accessories', 'headphones', 50),
  ('Gaming', 'gaming', 'gamepad', 60),
  ('Networking', 'networking', 'wifi', 70),
  ('Other Electronics', 'other-electronics', 'plug', 100)
on conflict (name) do nothing;

insert into public.locations (name, slug, region, sort_order) values
  ('Blantyre', 'blantyre', 'Southern', 10),
  ('Lilongwe', 'lilongwe', 'Central', 20),
  ('Mzuzu', 'mzuzu', 'Northern', 30),
  ('Zomba', 'zomba', 'Southern', 40),
  ('Kasungu', 'kasungu', 'Central', 50),
  ('Mangochi', 'mangochi', 'Southern', 60),
  ('Salima', 'salima', 'Central', 70),
  ('Karonga', 'karonga', 'Northern', 80),
  ('Dedza', 'dedza', 'Central', 90),
  ('Nkhotakota', 'nkhotakota', 'Central', 100)
on conflict (name) do nothing;

-- ============================================================
-- DONE
-- ============================================================

-- ============================================================
-- Gadget Malawi — Demo seed data
-- Creates demo seller accounts + 12 products.
-- Safe to run multiple times.
-- ============================================================

-- 1. Create demo auth users (so profiles can reference them)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'techhub@gadgetmalawi.mw',    crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"TechHub Malawi"}',    now(), now(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pcplanet@gadgetmalawi.mw',   crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"PC Planet MW"}',      now(), now(), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'digitalsol@gadgetmalawi.mw', crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Digital Solutions MW"}', now(), now(), '', '', '', ''),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'northern@gadgetmalawi.mw',   crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Northern Tech"}',     now(), now(), '', '', '', ''),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zomba@gadgetmalawi.mw',      crypt('demo-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Zomba Gadgets"}',     now(), now(), '', '', '', '')
on conflict (id) do nothing;

-- 2. Update those auto-created profiles with shop details
update public.profiles set
  user_type = 'shop',
  display_name = 'TechHub Malawi',
  shop_name = 'TechHub Malawi',
  shop_address = 'Chichiri Mall, Blantyre',
  shop_verified = true,
  verified_at = now(),
  phone = '+265 999 111 111'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  user_type = 'shop',
  display_name = 'PC Planet MW',
  shop_name = 'PC Planet MW',
  shop_address = 'Area 3, Lilongwe',
  shop_verified = true,
  verified_at = now(),
  phone = '+265 999 222 222'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  user_type = 'shop',
  display_name = 'Digital Solutions MW',
  shop_name = 'Digital Solutions MW',
  shop_address = 'Limbe, Blantyre',
  shop_verified = true,
  verified_at = now(),
  phone = '+265 999 333 333'
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  user_type = 'individual',
  display_name = 'Northern Tech',
  phone = '+265 999 444 444'
where id = '44444444-4444-4444-4444-444444444444';

update public.profiles set
  user_type = 'shop',
  display_name = 'Zomba Gadgets',
  shop_name = 'Zomba Gadgets',
  shop_address = 'Zomba Market',
  shop_verified = true,
  verified_at = now(),
  phone = '+265 999 555 555'
where id = '55555555-5555-5555-5555-555555555555';

-- 3. Insert products using category + location lookups
insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '11111111-1111-1111-1111-111111111111', c.id, l.id,
  'iPhone 15 Pro 256GB', 'Titanium · Unlocked', 'iphone-15-pro-256gb',
  'Brand new sealed iPhone 15 Pro. Comes with original box, cable, and one-year shop warranty.',
  1650000, 'new', 'active',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'phones' and l.slug = 'blantyre'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '11111111-1111-1111-1111-111111111111', c.id, l.id,
  'MacBook Air M2 13"', '8GB RAM · 256GB SSD', 'macbook-air-m2-13',
  'Lightly used MacBook Air M2. Perfect working condition, battery health 96%.',
  1250000, 'like-new', 'active',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'laptops' and l.slug = 'blantyre'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '22222222-2222-2222-2222-222222222222', c.id, l.id,
  'MSI GeForce RTX 4070', '12GB GDDR6X', 'msi-rtx-4070-ventus',
  'Brand new MSI RTX 4070 Ventus 3X. Perfect for 1440p gaming.',
  1180000, 'new', 'active',
  'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'pc-parts' and l.slug = 'lilongwe'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '33333333-3333-3333-3333-333333333333', c.id, l.id,
  'Samsung 990 Pro 2TB', 'NVMe M.2 · 7450MB/s', 'samsung-990-pro-2tb',
  'New Samsung 990 Pro NVMe SSD. 2TB capacity, Gen4 speeds.',
  580000, 'new', 'active',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'storage' and l.slug = 'blantyre'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '22222222-2222-2222-2222-222222222222', c.id, l.id,
  'Corsair Vengeance RGB Pro', '16GB (2×8GB) DDR4 3200MHz', 'corsair-vengeance-rgb-16gb',
  'Sealed Corsair Vengeance RGB Pro kit. 16GB dual channel, 3200MHz.',
  220000, 'new', 'active',
  'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'pc-parts' and l.slug = 'lilongwe'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '44444444-4444-4444-4444-444444444444', c.id, l.id,
  'Dell Latitude 5400', 'i5 8GB · 256GB SSD · 14"', 'dell-latitude-5400-i5',
  'Used Dell Latitude 5400 in good working condition. Perfect for work and study.',
  450000, 'used', 'active',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'laptops' and l.slug = 'blantyre'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '11111111-1111-1111-1111-111111111111', c.id, l.id,
  'ASUS ROG Strix G15', 'i5 · RTX 3050 · 16GB RAM', 'asus-rog-strix-g15',
  'Gaming laptop, well cared for. Handles modern games at 1080p high settings.',
  1450000, 'used', 'active',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'laptops' and l.slug = 'blantyre'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '11111111-1111-1111-1111-111111111111', c.id, l.id,
  'Samsung Galaxy S24 5G', '8GB RAM · 256GB · New', 'samsung-galaxy-s24-5g',
  'Brand new Samsung Galaxy S24. Sealed, with warranty.',
  1090000, 'new', 'active',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'phones' and l.slug = 'lilongwe'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '44444444-4444-4444-4444-444444444444', c.id, l.id,
  'Logitech MX Master 3S', 'Wireless · Bluetooth', 'logitech-mx-master-3s',
  'New Logitech MX Master 3S. Premium wireless mouse for productivity.',
  180000, 'new', 'active',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'accessories' and l.slug = 'mzuzu'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '55555555-5555-5555-5555-555555555555', c.id, l.id,
  'Anker Power Bank 20000mAh', '65W · USB-C PD', 'anker-powerbank-20000',
  'High-capacity power bank with fast charging. Great for travel.',
  95000, 'new', 'active',
  'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'accessories' and l.slug = 'zomba'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '44444444-4444-4444-4444-444444444444', c.id, l.id,
  'HP EliteBook 840 G8', 'i7 · 16GB RAM · 512GB SSD', 'hp-elitebook-840-g8',
  'Business-grade laptop. Great for professionals.',
  1150000, 'like-new', 'active',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'laptops' and l.slug = 'mzuzu'
on conflict (slug) do nothing;

insert into public.products
  (seller_id, category_id, location_id, title, subtitle, slug, description, price, condition, status, primary_image_url)
select
  '22222222-2222-2222-2222-222222222222', c.id, l.id,
  'WD Black SN850X 1TB', 'NVMe Gen4 · 7300MB/s', 'wd-black-sn850x-1tb',
  'New WD Black SN850X NVMe SSD. Gen4, 1TB, ideal for gaming.',
  320000, 'new', 'active',
  'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=500&fit=crop&auto=format&q=75'
from categories c, locations l
where c.slug = 'storage' and l.slug = 'lilongwe'
on conflict (slug) do nothing;