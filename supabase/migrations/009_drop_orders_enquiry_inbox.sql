-- ==============================================================================
-- Migration 009: Scope change - catalogue only, drop orders, switch to enquiry inbox
-- ==============================================================================

-- 1. Drop convert_enquiry_to_order function
drop function if exists public.convert_enquiry_to_order(uuid, text, text, text, integer);

-- 2. Drop orders table and associated triggers/policies
drop table if exists public.orders cascade;

-- 3. Drop order_status enum type
drop type if exists public.order_status cascade;

-- 4. Rename enquiry_status value 'converted' to 'handled'
alter type public.enquiry_status rename value 'converted' to 'handled';

-- 5. Add internal_notes column to enquiries for admin inbox notes
alter table public.enquiries add column if not exists internal_notes text;

-- 6. Enquiries table security & realtime publication re-assertion
-- (RLS remains admin-only for select/update/delete; insert open to public/anon)
alter table public.enquiries enable row level security;

-- Keep realtime enabled for enquiries table
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'enquiries'
  ) then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;
