create table deals (
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

create table enquiries (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  items_json jsonb not null,
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

