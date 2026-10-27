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

create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id) values (new.id)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;
