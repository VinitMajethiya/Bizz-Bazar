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

