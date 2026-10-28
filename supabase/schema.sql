-- ==============================================================================
-- BY RAYA.CO: MASTER CONSOLIDATED DATABASE SCHEMA
-- Scope: Digital Catalogue & Enquiry Inbox (No payment, No fulfilment tracking)
-- Paste this entire script into your Supabase SQL Editor and click RUN.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;

-- 2. CUSTOM TYPES & ENUMS
do $$ begin
  create type stock_status as enum ('in_stock', 'low_stock', 'sold_out');
exception when duplicate_object then null; end $$;

do $$ begin
  create type chat_channel as enum ('whatsapp', 'instagram');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enquiry_status as enum ('new', 'handled', 'dropped');
exception when duplicate_object then null; end $$;

-- If enquiry_status already existed previously with 'converted', rename it to 'handled'
do $$ begin
  alter type enquiry_status rename value 'converted' to 'handled';
exception when others then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percent', 'flat', 'fixed_price', 'bundle');
exception when duplicate_object then null; end $$;

-- 3. PROFILES & AUTH RBAC
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin'))
);

create or replace function handle_new_user() 
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created 
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_admin() 
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- 4. PRODUCTS & IMAGES
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  price_paise integer not null check (price_paise >= 0),
  compare_at_price_paise integer check (compare_at_price_paise is null or compare_at_price_paise > price_paise),
  stock_status stock_status not null default 'in_stock',
  stock_qty integer check (stock_qty is null or stock_qty >= 0),
  badge text,
  options jsonb not null default '{"materials":[],"sizes":[]}',
  specs_json jsonb not null default '{}',
  is_featured boolean not null default false,
  is_archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products (category) where not is_archived;

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  image_url text not null,
  storage_path text,
  alt text,
  is_hero boolean not null default false,
  display_order integer not null default 0,
  variant_key text
);

create unique index if not exists one_hero_per_product on product_images (product_id) where is_hero;

-- 5. DEALS & PROMOTIONS
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text unique,
  discount_type discount_type not null,
  discount_value integer not null,
  bundle_config jsonb,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  active boolean not null default true,
  applicable_products uuid[],
  created_at timestamptz not null default now()
);

-- 6. ENQUIRIES (INBOX MODEL - NO ORDERS TABLE)
-- Clean up legacy orders table if it existed from previous test phases
drop table if exists orders cascade;
drop function if exists convert_enquiry_to_order cascade;
drop type if exists order_status cascade;

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  items_json jsonb not null,
  subtotal_paise integer not null,
  discount_paise integer not null default 0,
  coupon_code text,
  channel chat_channel not null,
  customer_note text,
  internal_notes text,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

-- Ensure internal_notes exists if enquiries was created prior to Migration 009
alter table enquiries add column if not exists internal_notes text;

create index if not exists enquiries_status_idx on enquiries (status, created_at desc);

-- 7. REVIEWS & CMS CONTENT
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade,
  rating integer not null check (rating between 1 and 5),
  reviewer_name text not null check (char_length(reviewer_name) <= 80),
  title text check (char_length(title) <= 120),
  review_text text not null check (char_length(review_text) <= 2000),
  status review_status not null default 'pending',
  is_offline boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null
);

create table if not exists pages (
  slug text primary key,
  title text not null,
  body_md text not null default '',
  meta_description text,
  updated_at timestamptz not null default now()
);

create table if not exists newsletter_leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null unique check (char_length(contact) <= 120),
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text not null check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
alter table profiles         enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table deals            enable row level security;
alter table enquiries        enable row level security;
alter table reviews          enable row level security;
alter table site_settings    enable row level security;
alter table pages            enable row level security;
alter table newsletter_leads enable row level security;
alter table contact_messages enable row level security;

-- Profiles
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for select using (id = auth.uid());

-- Products
drop policy if exists "read live products" on products;
create policy "read live products" on products for select using (not is_archived or is_admin());
drop policy if exists "admin products" on products;
create policy "admin products" on products for all using (is_admin()) with check (is_admin());

-- Product Images
drop policy if exists "read images" on product_images;
create policy "read images" on product_images for select using (true);
drop policy if exists "admin images" on product_images;
create policy "admin images" on product_images for all using (is_admin()) with check (is_admin());

-- Deals
drop policy if exists "read live deals" on deals;
create policy "read live deals" on deals for select
  using (is_admin() or (active and start_date <= now() and (end_date is null or end_date > now())));
drop policy if exists "admin deals" on deals;
create policy "admin deals" on deals for all using (is_admin()) with check (is_admin());

-- Enquiries: Admin only. Customers insert only via the secure create_enquiry() RPC.
drop policy if exists "admin enquiries" on enquiries;
create policy "admin enquiries" on enquiries for all using (is_admin()) with check (is_admin());

-- Reviews
drop policy if exists "read approved reviews" on reviews;
create policy "read approved reviews" on reviews for select using (status = 'approved' or is_admin());
drop policy if exists "submit review" on reviews;
create policy "submit review" on reviews for insert
  with check (status = 'pending' and is_offline = false and rating between 1 and 5);
drop policy if exists "admin reviews" on reviews;
create policy "admin reviews" on reviews for all using (is_admin()) with check (is_admin());

-- Site Settings
drop policy if exists "read settings" on site_settings;
create policy "read settings" on site_settings for select using (true);
drop policy if exists "admin settings" on site_settings;
create policy "admin settings" on site_settings for all using (is_admin()) with check (is_admin());

-- Pages
drop policy if exists "read pages" on pages;
create policy "read pages" on pages for select using (true);
drop policy if exists "admin pages" on pages;
create policy "admin pages" on pages for all using (is_admin()) with check (is_admin());

-- Newsletter Leads (Drop Alerts)
drop policy if exists "join drop alerts" on newsletter_leads;
create policy "join drop alerts" on newsletter_leads for insert with check (true);
drop policy if exists "admin leads" on newsletter_leads;
create policy "admin leads" on newsletter_leads for select using (is_admin());
drop policy if exists "admin leads delete" on newsletter_leads;
create policy "admin leads delete" on newsletter_leads for delete using (is_admin());

-- Contact Messages
drop policy if exists "send contact" on contact_messages;
create policy "send contact" on contact_messages for insert with check (true);
drop policy if exists "admin messages" on contact_messages;
create policy "admin messages" on contact_messages for select using (is_admin());
drop policy if exists "admin messages del" on contact_messages;
create policy "admin messages del" on contact_messages for delete using (is_admin());

-- 9. CREATE ENQUIRY RPC
create or replace function create_enquiry(
  p_items jsonb,
  p_channel chat_channel,
  p_note text default null,
  p_coupon text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
  prod products;
  q int;
  lines jsonb := '[]';
  sub int := 0;
  v_ref text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'invalid cart';
  end if;

  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from products
      where id = (it->>'product_id')::uuid and not is_archived and stock_status <> 'sold_out';
    if not found then
      raise exception 'product unavailable';
    end if;

    q := greatest(1, least(10, coalesce((it->>'qty')::int, 1)));
    lines := lines || jsonb_build_object(
      'product_id', prod.id,
      'name', prod.name,
      'options', coalesce(it->'options', '{}'::jsonb),
      'unit_price_paise', prod.price_paise,
      'qty', q
    );
    sub := sub + prod.price_paise * q;
  end loop;

  v_ref := 'BR-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  insert into enquiries (ref, items_json, subtotal_paise, discount_paise, channel, customer_note, coupon_code)
    values (v_ref, lines, sub, 0, p_channel, left(p_note, 500), null);

  return jsonb_build_object(
    'ref', v_ref,
    'items', lines,
    'subtotal_paise', sub,
    'discount_paise', 0
  );
end $$;

grant execute on function create_enquiry(jsonb, chat_channel, text, text) to anon, authenticated;

-- 10. STORAGE BUCKET & POLICIES
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());

drop policy if exists "admin update images" on storage.objects;
create policy "admin update images" on storage.objects for update using (bucket_id = 'product-images' and is_admin());

drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'product-images' and is_admin());

-- 11. REALTIME STREAMING FOR ENQUIRIES
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'enquiries'
  ) then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;
