-- =============================================================================
-- Jennings Media — business functions & triggers
-- SECURITY DEFINER functions pin search_path = '' and fully qualify names.
-- =============================================================================

-- Identity helpers (used by RLS policies) ----------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = (select auth.uid()) and a.is_active
  );
$$;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id from public.customers c where c.user_id = (select auth.uid()) limit 1;
$$;

create or replace function public.current_photographer_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.id from public.photographers p
  where p.user_id = (select auth.uid()) and p.is_active
  limit 1;
$$;

-- Ownership checks for child tables. SECURITY DEFINER so policies on one table
-- never re-enter the policies of another (avoids RLS recursion).
create or replace function public.owns_booking(p_booking_id uuid, p_require_delivered boolean default false)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.bookings b
     where b.id = p_booking_id
       and b.customer_id = public.current_customer_id()
       and (not p_require_delivered or b.status = 'delivered')
  );
$$;

create or replace function public.is_assigned_to_booking(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.appointments a
     where a.booking_id = p_booking_id
       and a.photographer_id = public.current_photographer_id()
       and a.status <> 'cancelled'
  );
$$;

create or replace function public.is_assigned_to_property(p_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.bookings b
      join public.appointments a on a.booking_id = b.id
     where b.property_id = p_property_id
       and a.photographer_id = public.current_photographer_id()
       and a.status <> 'cancelled'
  );
$$;

-- Mirror new auth users into public.users ------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.handle_auth_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users set email = coalesce(new.email, email) where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_auth_user_email_change();

-- Human-friendly numbers --------------------------------------------------------------
create or replace function public.assign_order_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'JM-' || nextval('public.booking_number_seq')::text;
  end if;
  return new;
end;
$$;

create trigger assign_order_number
  before insert on public.bookings
  for each row execute function public.assign_order_number();

create or replace function public.assign_invoice_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.invoice_number is null or new.invoice_number = '' then
    new.invoice_number := 'INV-' || nextval('public.invoice_number_seq')::text;
  end if;
  return new;
end;
$$;

create trigger assign_invoice_number
  before insert on public.invoices
  for each row execute function public.assign_invoice_number();

create or replace function public.assign_referral_code()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_base text;
  v_code text;
  v_attempt integer := 0;
begin
  if new.referral_code is not null and new.referral_code <> '' then
    return new;
  end if;
  v_base := upper(left(regexp_replace(
    coalesce(nullif(new.first_name, ''), split_part(new.email, '@', 1)), '[^A-Za-z]', '', 'g'), 8));
  if v_base = '' then
    v_base := 'AGENT';
  end if;
  loop
    v_attempt := v_attempt + 1;
    v_code := v_base || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4 + (v_attempt / 5)));
    exit when not exists (select 1 from public.customers c where c.referral_code = v_code);
  end loop;
  new.referral_code := v_code;
  return new;
end;
$$;

create trigger assign_referral_code
  before insert on public.customers
  for each row execute function public.assign_referral_code();

-- Promo codes are stored upper-case.
create or replace function public.normalize_promo_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.code := upper(trim(new.code));
  return new;
end;
$$;

create trigger normalize_promo_code
  before insert or update of code on public.promo_codes
  for each row execute function public.normalize_promo_code();

-- Link a signed-in user to their CRM record ----------------------------------------------
-- Guests can book without an account. When they later sign in with a *verified*
-- email, this attaches the existing customer record (and its bookings) to them.
create or replace function public.claim_customer_profile()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_confirmed timestamptz;
  v_meta jsonb;
  v_customer_id uuid;
begin
  if v_uid is null then
    return null;
  end if;

  select c.id into v_customer_id from public.customers c where c.user_id = v_uid;
  if v_customer_id is not null then
    return v_customer_id;
  end if;

  select u.email, u.email_confirmed_at, u.raw_user_meta_data
    into v_email, v_confirmed, v_meta
    from auth.users u where u.id = v_uid;
  if v_email is null or v_email = '' then
    return null;
  end if;

  insert into public.users (id, email, full_name)
  values (v_uid, v_email, nullif(v_meta ->> 'full_name', ''))
  on conflict (id) do nothing;

  if v_confirmed is not null then
    update public.customers c
       set user_id = v_uid
     where lower(c.email) = lower(v_email) and c.user_id is null
     returning c.id into v_customer_id;
  end if;

  if v_customer_id is null and not exists (
    select 1 from public.customers c where lower(c.email) = lower(v_email)
  ) then
    insert into public.customers (user_id, email, first_name, last_name, phone)
    values (
      v_uid,
      lower(v_email),
      coalesce(nullif(split_part(coalesce(v_meta ->> 'full_name', ''), ' ', 1), ''), ''),
      coalesce(nullif(regexp_replace(coalesce(v_meta ->> 'full_name', ''), '^\S+\s*', ''), ''), ''),
      nullif(v_meta ->> 'phone', '')
    )
    returning id into v_customer_id;
  end if;

  return v_customer_id;
end;
$$;

-- Bootstrap an administrator (run from the SQL editor) --------------------------------------
create or replace function public.promote_to_admin(p_email text, p_role text default 'owner')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid;
  v_email text;
begin
  select u.id, u.email into v_uid, v_email from auth.users u where lower(u.email) = lower(p_email);
  if v_uid is null then
    raise exception 'No user with email %. Create the account first (sign up on /login).', p_email;
  end if;
  insert into public.users (id, email) values (v_uid, v_email) on conflict (id) do nothing;
  insert into public.admins (user_id, role)
  values (v_uid, p_role)
  on conflict (user_id) do update set role = excluded.role, is_active = true;
end;
$$;

-- Slot reservation (race-safe) ----------------------------------------------------------------
-- The TypeScript availability engine proposes slots; this function re-checks capacity
-- inside a transaction-scoped advisory lock so two customers can't take the last slot.
create or replace function public.reserve_appointment(
  p_booking_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_day_start timestamptz,
  p_day_end timestamptz,
  p_capacity integer,
  p_max_per_day integer,
  p_buffer_minutes integer default 0,
  p_kind text default 'shoot',
  p_status text default 'scheduled',
  p_hold_minutes integer default 35,
  p_photographer_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_overlaps integer;
  v_day_count integer;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('jm-appointments:' || p_day_start::text));

  select count(*) into v_overlaps
    from public.appointments a
   where (a.status = 'scheduled' or (a.status = 'held' and a.hold_expires_at > now()))
     and tstzrange(
           a.starts_at - make_interval(mins => a.buffer_before_minutes),
           a.ends_at + make_interval(mins => a.buffer_after_minutes), '[)')
      && tstzrange(p_starts_at, p_ends_at, '[)');
  if v_overlaps >= greatest(p_capacity, 1) then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  if p_max_per_day is not null then
    select count(*) into v_day_count
      from public.appointments a
     where (a.status = 'scheduled' or (a.status = 'held' and a.hold_expires_at > now()))
       and a.starts_at >= p_day_start and a.starts_at < p_day_end;
    if v_day_count >= p_max_per_day then
      raise exception 'day_full' using errcode = 'P0001';
    end if;
  end if;

  insert into public.appointments (
    booking_id, photographer_id, kind, status, starts_at, ends_at, hold_expires_at,
    buffer_before_minutes, buffer_after_minutes
  ) values (
    p_booking_id, p_photographer_id, p_kind, p_status, p_starts_at, p_ends_at,
    case when p_status = 'held' then now() + make_interval(mins => p_hold_minutes) end,
    p_buffer_minutes, p_buffer_minutes
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Release slots whose checkout was abandoned ---------------------------------------------------
create or replace function public.expire_stale_holds()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  with expired as (
    update public.appointments
       set status = 'cancelled'
     where status = 'held' and hold_expires_at is not null and hold_expires_at < now()
     returning booking_id
  )
  update public.bookings b
     set status = 'cancelled',
         cancelled_at = now(),
         cancellation_reason = coalesce(b.cancellation_reason, 'Checkout was not completed')
    from expired e
   where b.id = e.booking_id and b.status = 'requested' and b.amount_paid_cents = 0;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Promo usage (atomic) ---------------------------------------------------------------------------
create or replace function public.consume_promo_code(p_promo_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.promo_codes
     set usage_count = usage_count + 1
   where id = p_promo_id
     and is_active
     and (usage_limit is null or usage_count < usage_limit);
  return found;
end;
$$;

-- Recompute paid / refunded totals from the payments ledger -----------------------------------
create or replace function public.sync_booking_financials(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_paid integer;
  v_refunded integer;
  v_net integer;
  v_total integer;
  v_status text;
begin
  select
    coalesce(sum(p.amount_cents) filter (where p.status in ('succeeded', 'partially_refunded', 'refunded')), 0),
    coalesce(sum(p.refunded_cents) filter (where p.status in ('succeeded', 'partially_refunded', 'refunded')), 0)
    into v_paid, v_refunded
    from public.payments p
   where p.booking_id = p_booking_id;

  select b.total_cents into v_total from public.bookings b where b.id = p_booking_id;
  if v_total is null then
    return;
  end if;
  v_net := v_paid - v_refunded;

  v_status := case
    when v_paid = 0 then 'unpaid'
    when v_refunded >= v_paid then 'refunded'
    when v_refunded > 0 then 'partially_refunded'
    when v_net >= v_total then 'paid'
    else 'deposit_paid'
  end;

  update public.bookings
     set amount_paid_cents = v_net,
         amount_refunded_cents = v_refunded,
         payment_status = v_status
   where id = p_booking_id;

  update public.invoices i
     set amount_paid_cents = v_net,
         status = case
           when i.status in ('void', 'draft', 'uncollectible') then i.status
           when v_net >= i.total_cents then 'paid'
           else 'open'
         end,
         paid_at = case when v_net >= i.total_cents then coalesce(i.paid_at, now()) else null end
   where i.booking_id = p_booking_id and i.status <> 'void';
end;
$$;

-- Reporting -----------------------------------------------------------------------------------------
create or replace view public.customer_stats
with (security_invoker = true) as
select
  c.id as customer_id,
  count(b.id) filter (where b.status <> 'cancelled') as bookings_count,
  coalesce(sum(b.amount_paid_cents), 0)::bigint as lifetime_revenue_cents,
  coalesce(sum(b.total_cents) filter (where b.status <> 'cancelled'), 0)::bigint as lifetime_booked_cents,
  max(b.created_at) as last_booking_at,
  (
    select min(a.starts_at)
      from public.appointments a
      join public.bookings b2 on b2.id = a.booking_id
     where b2.customer_id = c.id and a.status = 'scheduled' and a.starts_at > now()
  ) as next_appointment_at
from public.customers c
left join public.bookings b on b.customer_id = c.id
group by c.id;

-- Admin KPIs in a single round trip. SECURITY INVOKER (RLS applies) plus an explicit guard.
create or replace function public.admin_dashboard_metrics(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'revenue_cents', coalesce((
      select sum(p.amount_cents - p.refunded_cents) from public.payments p
       where p.status in ('succeeded', 'partially_refunded') and p.paid_at >= p_from and p.paid_at < p_to
    ), 0),
    'bookings_count', (
      select count(*) from public.bookings b
       where b.created_at >= p_from and b.created_at < p_to and b.status <> 'cancelled'
    ),
    'booked_value_cents', coalesce((
      select sum(b.total_cents) from public.bookings b
       where b.created_at >= p_from and b.created_at < p_to and b.status <> 'cancelled'
    ), 0),
    'pending_deliveries', (
      select count(*) from public.bookings b
       where b.status in ('shoot_completed', 'editing', 'ready_for_delivery')
    ),
    'unpaid_invoices', (
      select count(*) from public.invoices i where i.status = 'open' and i.amount_due_cents > 0
    ),
    'unpaid_invoices_cents', coalesce((
      select sum(i.amount_due_cents) from public.invoices i where i.status = 'open'
    ), 0),
    'new_leads', (select count(*) from public.contact_leads l where l.status = 'new'),
    'requested_bookings', (select count(*) from public.bookings b where b.status = 'requested')
  );
end;
$$;

create or replace function public.admin_revenue_by_month(p_months integer, p_timezone text)
returns table (month date, revenue_cents bigint, bookings_count bigint)
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  with months as (
    select (date_trunc('month', now() at time zone p_timezone) - make_interval(months => g))::date as month
      from generate_series(0, greatest(p_months, 1) - 1) g
  )
  select
    m.month,
    coalesce((
      select sum(p.amount_cents - p.refunded_cents)
        from public.payments p
       where p.status in ('succeeded', 'partially_refunded')
         and date_trunc('month', p.paid_at at time zone p_timezone)::date = m.month
    ), 0)::bigint,
    coalesce((
      select count(*)
        from public.bookings b
       where b.status <> 'cancelled'
         and date_trunc('month', b.created_at at time zone p_timezone)::date = m.month
    ), 0)::bigint
  from months m
  order by m.month;
end;
$$;
