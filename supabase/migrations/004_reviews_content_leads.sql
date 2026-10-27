create table reviews (
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

create table site_settings (
  key text primary key,
  value jsonb not null
);

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
  name text not null,
  contact text not null,
  message text not null check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

