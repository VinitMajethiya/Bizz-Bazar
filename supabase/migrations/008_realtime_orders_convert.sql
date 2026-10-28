-- 008_realtime_orders_convert.sql
-- Enables realtime for enquiries, adds updated_at trigger for orders,
-- and creates convert_enquiry_to_order transactional RPC.

-- 1. Enable realtime for enquiries
alter publication supabase_realtime add table public.enquiries;

-- 2. Trigger for updated_at on orders
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_orders_updated_at
  before update on public.orders
  for each row execute function set_updated_at();

-- 3. Function to convert an enquiry to an order atomically
create or replace function convert_enquiry_to_order(
  p_enquiry_id uuid,
  p_name text,
  p_phone text,
  p_address text,
  p_total_paise integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_enquiry enquiries%rowtype;
  v_order_id uuid;
begin
  -- Enforce admin authorization inside the function
  if not is_admin() then
    raise exception 'unauthorized: admin access required';
  end if;

  -- Input validations
  if p_name is null or length(trim(p_name)) < 2 then
    raise exception 'invalid customer name';
  end if;

  if p_phone is null or length(trim(p_phone)) < 8 then
    raise exception 'invalid customer phone';
  end if;

  if p_address is null or length(trim(p_address)) not between 10 and 300 then
    raise exception 'address must be between 10 and 300 characters';
  end if;

  if p_total_paise is null or p_total_paise < 0 then
    raise exception 'invalid order total';
  end if;

  -- Lock enquiry row for atomic transaction
  select * into v_enquiry
  from enquiries
  where id = p_enquiry_id
  for update;

  if not found then
    raise exception 'enquiry not found';
  end if;

  if v_enquiry.status = 'converted' then
    raise exception 'enquiry has already been converted to an order';
  end if;

  if v_enquiry.status = 'dropped' then
    raise exception 'cannot convert a dropped enquiry';
  end if;

  -- Create order record
  insert into orders (
    enquiry_id,
    customer_name,
    customer_phone,
    shipping_address,
    total_paise,
    status
  )
  values (
    p_enquiry_id,
    trim(p_name),
    trim(p_phone),
    trim(p_address),
    p_total_paise,
    'confirmed'
  )
  returning id into v_order_id;

  -- Mark enquiry as converted
  update enquiries
  set status = 'converted'
  where id = p_enquiry_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'enquiry_id', p_enquiry_id,
    'status', 'confirmed',
    'total_paise', p_total_paise
  );
end;
$$;

-- Secure execution permissions
revoke execute on function convert_enquiry_to_order(uuid, text, text, text, integer) from public, anon;
grant execute on function convert_enquiry_to_order(uuid, text, text, text, integer) to authenticated;
