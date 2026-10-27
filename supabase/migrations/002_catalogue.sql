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
  variant_key text
);
create unique index one_hero_per_product on product_images (product_id) where is_hero;

