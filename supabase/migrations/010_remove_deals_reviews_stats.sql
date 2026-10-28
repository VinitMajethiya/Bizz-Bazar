-- ========================================================
-- Migration 010: Remove Deals and Add Review Stats & show_on_home
-- ========================================================

-- 1. Drop deals table, discount_type enum, and any legacy calculation functions
drop table if exists public.deals cascade;
drop type if exists public.discount_type cascade;
drop function if exists public.quote_cart cascade;
drop function if exists public.compute_cart cascade;

-- 2. Clean coupon and discount columns from enquiries table
alter table public.enquiries drop column if exists coupon_code;
alter table public.enquiries drop column if exists discount_paise;

-- 3. Replace create_enquiry RPC: 3 arguments (p_items, p_channel, p_note default null)
drop function if exists public.create_enquiry(jsonb, chat_channel, text, text);
drop function if exists public.create_enquiry(jsonb, chat_channel, text);

create or replace function public.create_enquiry(
  p_items jsonb,
  p_channel chat_channel,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions as $$
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
    if prod.stock_qty is not null and prod.stock_qty < q then
      raise exception 'insufficient stock';
    end if;

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

  insert into enquiries (ref, items_json, subtotal_paise, channel, customer_note, status)
    values (v_ref, lines, sub, p_channel, left(trim(p_note), 500), 'new');

  return jsonb_build_object(
    'ref', v_ref,
    'items', lines,
    'subtotal_paise', sub
  );
end $$;

revoke execute on function public.create_enquiry(jsonb, chat_channel, text) from public;
grant execute on function public.create_enquiry(jsonb, chat_channel, text) to anon, authenticated;

-- 4. Reviews: Add show_on_home column
alter table public.reviews add column if not exists show_on_home boolean not null default false;

-- 5. Reviews: Replace public insert policy with strict field & status validation
drop policy if exists "submit review" on public.reviews;
drop policy if exists "public create reviews" on public.reviews;

create policy "submit review" on public.reviews for insert
  with check (
    status = 'pending' and
    is_offline = false and
    show_on_home = false and
    rating between 1 and 5 and
    char_length(reviewer_name) <= 80 and
    (title is null or char_length(title) <= 120) and
    char_length(review_text) <= 2000
  );

-- 6. View product_review_stats (security_invoker = true for RLS inheritance)
create or replace view public.product_review_stats with (security_invoker = true) as
select
  product_id,
  count(*)::integer as review_count,
  round(avg(rating)::numeric, 1)::double precision as average_rating
from public.reviews
where status = 'approved' and product_id is not null
group by product_id;

grant select on public.product_review_stats to anon, authenticated;
