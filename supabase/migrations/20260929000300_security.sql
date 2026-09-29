-- =============================================================================
-- Jennings Media — Row Level Security, grants and function privileges
--
-- Model:
--   * anon           : read published marketing content only. Never writes.
--   * authenticated  : customers read their own records; admins (public.admins)
--                      get full access through is_admin() policies.
--   * service_role   : server-only key (bypasses RLS) used for guest bookings,
--                      Stripe webhooks, cron jobs and email logging.
-- Customer writes go through validated Server Actions, not direct table access.
-- =============================================================================

-- Table privileges (RLS still filters every row) ---------------------------------
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;

-- Enable RLS everywhere + blanket admin policy -------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'business_settings', 'users', 'admins', 'customers', 'customer_notes', 'photographers',
    'service_areas', 'services', 'packages', 'package_services', 'add_ons', 'add_on_triggers',
    'promo_codes', 'properties', 'bookings', 'booking_services', 'appointments', 'schedule_blocks',
    'booking_events', 'invoices', 'payments', 'promo_redemptions', 'referrals', 'customer_favorites',
    'media', 'portfolio_projects', 'portfolio_media', 'testimonials', 'contact_leads',
    'notifications', 'webhook_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    if t <> 'webhook_events' then
      execute format(
        'create policy "Admins have full access" on public.%I for all to authenticated '
        'using ((select public.is_admin())) with check ((select public.is_admin()))',
        t
      );
    end if;
  end loop;
end;
$$;

-- Public marketing content -------------------------------------------------------------
create policy "Public can read active services" on public.services
  for select to anon, authenticated using (is_active);

create policy "Public can read active packages" on public.packages
  for select to anon, authenticated using (is_active);

create policy "Public can read package contents" on public.package_services
  for select to anon, authenticated using (
    exists (select 1 from public.packages p where p.id = package_id and p.is_active)
  );

create policy "Public can read active add-ons" on public.add_ons
  for select to anon, authenticated using (is_active);

create policy "Public can read add-on triggers" on public.add_on_triggers
  for select to anon, authenticated using (true);

create policy "Public can read active service areas" on public.service_areas
  for select to anon, authenticated using (is_active);

create policy "Public can read published projects" on public.portfolio_projects
  for select to anon, authenticated using (is_published);

create policy "Public can read published project media" on public.portfolio_media
  for select to anon, authenticated using (
    exists (select 1 from public.portfolio_projects p where p.id = project_id and p.is_published)
  );

create policy "Public can read published testimonials" on public.testimonials
  for select to anon, authenticated using (is_published);

-- Signed-in users: their own profile --------------------------------------------------
create policy "Users read own profile" on public.users
  for select to authenticated using (id = (select auth.uid()));

create policy "Users update own profile" on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users see own admin membership" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Customers: read-only access to their own records --------------------------------------
create policy "Customers read own record" on public.customers
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Customers read own properties" on public.properties
  for select to authenticated using (customer_id = (select public.current_customer_id()));

create policy "Customers read own bookings" on public.bookings
  for select to authenticated using (customer_id = (select public.current_customer_id()));

create policy "Customers read own line items" on public.booking_services
  for select to authenticated using (public.owns_booking(booking_id));

create policy "Customers read own appointments" on public.appointments
  for select to authenticated using (public.owns_booking(booking_id));

create policy "Customers read customer-visible events" on public.booking_events
  for select to authenticated using (visibility = 'customer' and public.owns_booking(booking_id));

create policy "Customers read own invoices" on public.invoices
  for select to authenticated using (
    customer_id = (select public.current_customer_id()) and status <> 'draft'
  );

create policy "Customers read own payments" on public.payments
  for select to authenticated using (customer_id = (select public.current_customer_id()));

-- Media becomes visible to the client only once the order is delivered.
create policy "Customers read delivered media" on public.media
  for select to authenticated using (is_visible and public.owns_booking(booking_id, true));

create policy "Customers read own referrals" on public.referrals
  for select to authenticated using (referrer_id = (select public.current_customer_id()));

create policy "Customers read own reward codes" on public.promo_codes
  for select to authenticated using (customer_id = (select public.current_customer_id()));

create policy "Customers read own favorites" on public.customer_favorites
  for select to authenticated using (customer_id = (select public.current_customer_id()));

create policy "Customers add own favorites" on public.customer_favorites
  for insert to authenticated with check (customer_id = (select public.current_customer_id()));

create policy "Customers remove own favorites" on public.customer_favorites
  for delete to authenticated using (customer_id = (select public.current_customer_id()));

-- Photographers (foundation for a future crew app) -------------------------------------------
create policy "Photographers read own profile" on public.photographers
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Photographers read assigned appointments" on public.appointments
  for select to authenticated using (photographer_id = (select public.current_photographer_id()));

create policy "Photographers read assigned bookings" on public.bookings
  for select to authenticated using (public.is_assigned_to_booking(id));

create policy "Photographers read assigned properties" on public.properties
  for select to authenticated using (public.is_assigned_to_property(id));

-- Function privileges -------------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_customer_id() to authenticated;
grant execute on function public.current_photographer_id() to authenticated;
grant execute on function public.owns_booking(uuid, boolean) to authenticated;
grant execute on function public.is_assigned_to_booking(uuid) to authenticated;
grant execute on function public.is_assigned_to_property(uuid) to authenticated;
grant execute on function public.claim_customer_profile() to authenticated;
grant execute on function public.admin_dashboard_metrics(timestamptz, timestamptz) to authenticated;
grant execute on function public.admin_revenue_by_month(integer, text) to authenticated;

-- Server-only (service_role) operations.
revoke execute on function public.promote_to_admin(text, text) from authenticated;
revoke execute on function public.reserve_appointment(
  uuid, timestamptz, timestamptz, timestamptz, timestamptz, integer, integer, integer, text, text, integer, uuid
) from authenticated;
revoke execute on function public.expire_stale_holds() from authenticated;
revoke execute on function public.consume_promo_code(uuid) from authenticated;
revoke execute on function public.sync_booking_financials(uuid) from authenticated;
grant execute on all functions in schema public to service_role;
