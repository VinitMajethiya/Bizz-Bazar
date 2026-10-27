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

  -- Until Phase 6 deals validation: store discount_paise = 0 and coupon_code = null
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

