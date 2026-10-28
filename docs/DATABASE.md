# DATABASE.md

Supabase Postgres. Put each block in its own numbered file under `supabase/migrations/`. Prices are integer paise.

## 001 types, profiles, admin check
```sql
create extension if not exists pgcrypto;

create type stock_status  as enum ('in_stock','low_stock','sold_out');
create type chat_channel  as enum ('whatsapp','instagram');
create type enquiry_status as enum ('new','converted','dropped');
create type order_status  as enum ('confirmed','processing','packed','shipped','delivered','cancelled');
create type review_status as enum ('pending','approved','rejected');
create type discount_type as enum ('percent','flat','fixed_price','bundle');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin'))
);

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into profiles(id) values (new.id); return new; end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;
```
Make the owner an admin after they sign up: `update profiles set role='admin' where id = '<auth user id>';`

## 002 catalogue
```sql
create table products (
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
create index on products (category) where not is_archived;

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  image_url text not null,
  storage_path text,
  alt text,
  is_hero boolean not null default false,
  display_order integer not null default 0,
  variant_key text            -- for example 'Silver' to show this image when that material is picked
);
create unique index one_hero_per_product on product_images (product_id) where is_hero;
```

## 003 deals, enquiries, orders
```sql
create table deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text unique,
  discount_type discount_type not null,
  discount_value integer not null,        -- percent (0-100), paise for flat and fixed_price
  bundle_config jsonb,                    -- for example {"buy":2,"get_free":1}
  start_date timestamptz not null default now(),
  end_date timestamptz,
  active boolean not null default true,
  applicable_products uuid[],             -- null means all products
  created_at timestamptz not null default now()
);

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  items_json jsonb not null,              -- [{product_id,name,options,unit_price_paise,qty}]
  subtotal_paise integer not null,
  discount_paise integer not null default 0,
  coupon_code text,
  channel chat_channel not null,
  customer_note text,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);
create index on enquiries (status, created_at desc);

create table orders (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid unique references enquiries,
  customer_name text,
  customer_phone text,
  shipping_address text,
  courier text,
  tracking_number text,
  internal_notes text,
  status order_status not null default 'confirmed',
  total_paise integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```
Note: enquiries use `new / converted / dropped`. The fulfilment pipeline lives on `orders`. In the admin UI show them as one pipeline: New (enquiry) then Confirmed, Processing, Packed, Shipped, Delivered, Cancelled.

## 004 reviews, content, leads
```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade,   -- null for site-wide testimonials
  rating integer not null check (rating between 1 and 5),
  reviewer_name text not null check (char_length(reviewer_name) <= 80),
  title text check (char_length(title) <= 120),
  review_text text not null check (char_length(review_text) <= 2000),
  status review_status not null default 'pending',
  is_offline boolean not null default false,
  created_at timestamptz not null default now()
);

create table site_settings (key text primary key, value jsonb not null);

create table pages (
  slug text primary key,
  title text not null,
  body_md text not null default '',
  meta_description text,
  updated_at timestamptz not null default now()
);

create table newsletter_leads (
  id uuid primary key default gen_random_uuid(),
  contact text not null unique check (char_length(contact) <= 120),
  created_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, contact text not null, message text not null check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);
```

## 005 row level security
```sql
alter table profiles          enable row level security;
alter table products          enable row level security;
alter table product_images    enable row level security;
alter table deals             enable row level security;
alter table enquiries         enable row level security;
alter table orders            enable row level security;
alter table reviews           enable row level security;
alter table site_settings     enable row level security;
alter table pages             enable row level security;
alter table newsletter_leads  enable row level security;
alter table contact_messages  enable row level security;

create policy "own profile"        on profiles for select using (id = auth.uid());

create policy "read live products" on products for select using (not is_archived or is_admin());
create policy "admin products"     on products for all using (is_admin()) with check (is_admin());

create policy "read images"        on product_images for select using (true);
create policy "admin images"       on product_images for all using (is_admin()) with check (is_admin());

create policy "read live deals"    on deals for select
  using (is_admin() or (active and start_date <= now() and (end_date is null or end_date > now())));
create policy "admin deals"        on deals for all using (is_admin()) with check (is_admin());

-- enquiries: no public policies. Customers insert only through create_enquiry().
create policy "admin enquiries"    on enquiries for all using (is_admin()) with check (is_admin());
create policy "admin orders"       on orders    for all using (is_admin()) with check (is_admin());

create policy "read approved reviews" on reviews for select using (status = 'approved' or is_admin());
create policy "submit review"      on reviews for insert
  with check (status = 'pending' and is_offline = false and rating between 1 and 5);
create policy "admin reviews"      on reviews for all using (is_admin()) with check (is_admin());

create policy "read settings"      on site_settings for select using (true);
create policy "admin settings"     on site_settings for all using (is_admin()) with check (is_admin());
create policy "read pages"         on pages for select using (true);
create policy "admin pages"        on pages for all using (is_admin()) with check (is_admin());

create policy "join drop alerts"   on newsletter_leads for insert with check (true);
create policy "admin leads"        on newsletter_leads for select using (is_admin());
create policy "admin leads delete" on newsletter_leads for delete using (is_admin());

create policy "send contact"       on contact_messages for insert with check (true);
create policy "admin messages"     on contact_messages for select using (is_admin());
create policy "admin messages del" on contact_messages for delete using (is_admin());
```
Keep secrets out of `site_settings`: it is world-readable.

## 006 create_enquiry RPC (server recomputes prices)
```sql
create function create_enquiry(p_items jsonb, p_channel chat_channel, p_note text default null, p_coupon text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare it jsonb; prod products; q int; lines jsonb := '[]'; sub int := 0; v_ref text;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'invalid cart';
  end if;
  for it in select * from jsonb_array_elements(p_items) loop
    select * into prod from products
      where id = (it->>'product_id')::uuid and not is_archived and stock_status <> 'sold_out';
    if not found then raise exception 'product unavailable'; end if;
    q := greatest(1, least(10, coalesce((it->>'qty')::int, 1)));
    lines := lines || jsonb_build_object('product_id', prod.id, 'name', prod.name,
             'options', coalesce(it->'options','{}'::jsonb), 'unit_price_paise', prod.price_paise, 'qty', q);
    sub := sub + prod.price_paise * q;
  end loop;
  -- TODO (Phase 6): validate p_coupon against live deals and compute discount_paise here.
  v_ref := 'BR-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  insert into enquiries (ref, items_json, subtotal_paise, channel, customer_note, coupon_code)
    values (v_ref, lines, sub, p_channel, left(p_note, 500), p_coupon);
  return jsonb_build_object('ref', v_ref, 'items', lines, 'subtotal_paise', sub);
end $$;
grant execute on function create_enquiry(jsonb, chat_channel, text, text) to anon, authenticated;
```
Add rate limiting at the edge (Vercel or a Supabase Edge Function in front) before launch, because this function is callable by anyone.

## 007 storage
Create a public bucket `product-images`. Policies:
```sql
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());
create policy "admin update images" on storage.objects for update using (bucket_id = 'product-images' and is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'product-images' and is_admin());
```
Client-side, resize uploads to 1600px on the long edge and re-encode as WebP or JPEG before upload.

## 008 realtime, orders updated_at trigger, and convert_enquiry_to_order RPC
```sql
-- Realtime publications for admin stream
alter publication supabase_realtime add table public.enquiries;

-- Order updated_at trigger
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger trigger_orders_updated_at before update on public.orders for each row execute function set_updated_at();

-- Transactional conversion with row locking and admin security
create or replace function convert_enquiry_to_order(
  p_enquiry_id uuid, p_name text, p_phone text, p_address text, p_total_paise integer
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_enquiry enquiries%rowtype; v_order_id uuid;
begin
  if not is_admin() then raise exception 'unauthorized: admin access required'; end if;
  select * into v_enquiry from enquiries where id = p_enquiry_id for update;
  if not found then raise exception 'enquiry not found'; end if;
  if v_enquiry.status = 'converted' then raise exception 'enquiry has already been converted to an order'; end if;
  if v_enquiry.status = 'dropped' then raise exception 'cannot convert a dropped enquiry'; end if;

  insert into orders (enquiry_id, customer_name, customer_phone, shipping_address, total_paise, status)
    values (p_enquiry_id, trim(p_name), trim(p_phone), trim(p_address), p_total_paise, 'confirmed')
    returning id into v_order_id;

  update enquiries set status = 'converted' where id = p_enquiry_id;

  return jsonb_build_object('order_id', v_order_id, 'enquiry_id', p_enquiry_id, 'status', 'confirmed', 'total_paise', p_total_paise);
end $$;
revoke execute on function convert_enquiry_to_order(uuid, text, text, text, integer) from public, anon;
grant execute on function convert_enquiry_to_order(uuid, text, text, text, integer) to authenticated;
```

## Settings keys
`brand_name, whatsapp_number, instagram_handle, support_email, business_hours, ticker_text, hero_headline, hero_text, hero_image_url, story_teaser, guarantees (array of {title,text}), footer_text`.
