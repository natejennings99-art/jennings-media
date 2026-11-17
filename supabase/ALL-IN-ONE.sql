-- =============================================================================
-- Jennings Media — ALL-IN-ONE database setup
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run again:
-- tables, indexes, sequences, triggers and policies are created only if missing
-- (policies and triggers are dropped and re-created so they match this file).
-- Built from the 7 files in supabase/migrations, in this order:
--   1. 20260929000100_core_schema.sql
--   2. 20260929000200_functions.sql
--   3. 20260929000300_security.sql
--   4. 20260929000400_storage.sql
--   5. 20260929000500_agency.sql
--   6. 20261104000100_creator_applicants.sql
--   7. 20261114000100_creator_areas.sql
-- If you change a migration, rebuild this file instead of editing it by hand.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 20260929000100_core_schema.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- Jennings Media — core schema
-- Money is stored in integer cents. Timestamps are timestamptz (UTC).
-- Every table has RLS enabled in 20260929000300_security.sql.
-- =============================================================================

create extension if not exists btree_gist with schema extensions;

-- Generic updated_at trigger ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Business settings (singleton row, id = 1) --------------------------------------
create table if not exists public.business_settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null default 'Jennings Media',
  legal_name text,
  tagline text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text not null default 'US',
  latitude double precision,
  longitude double precision,
  timezone text not null default 'America/New_York',
  currency text not null default 'usd',
  tax_rate_bps integer not null default 0 check (tax_rate_bps between 0 and 5000),
  tax_label text not null default 'Sales tax',
  tax_travel_fee boolean not null default false,
  -- { allow_full, allow_deposit, allow_pay_later, deposit_type, deposit_value, pay_later_note }
  payment_options jsonb not null default '{}'::jsonb,
  -- { working_hours, slot_interval_minutes, max_shoots_per_day, travel_buffer_minutes,
  --   default_duration_minutes, min_notice_hours, max_advance_days, hold_minutes, twilight_lead_minutes }
  scheduling jsonb not null default '{}'::jsonb,
  -- { enabled, referrer_reward_cents, referee_discount_type, referee_discount_value, qualify_on }
  referral_program jsonb not null default '{}'::jsonb,
  -- { admin_emails[], reminder_hours_before, sms_enabled, reply_to }
  notifications jsonb not null default '{}'::jsonb,
  -- { ga4_id, meta_pixel_id, google_ads_id, google_ads_booking_label }
  analytics jsonb not null default '{}'::jsonb,
  -- { instagram, facebook, youtube, tiktok, linkedin }
  social_links jsonb not null default '{}'::jsonb,
  -- { outside_area_policy: 'quote' | 'reject', outside_area_fee_cents }
  service_area_policy jsonb not null default '{}'::jsonb,
  hero_video_url text,
  hero_image_url text,
  updated_at timestamptz not null default now()
);

-- Users (profile mirror of auth.users) -------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customers (CRM record; may exist before the person creates a login) -----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users (id) on delete set null,
  email text not null check (position('@' in email) > 1),
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  company text,
  brokerage text,
  license_number text,
  billing_address jsonb,
  referral_code text unique,
  referred_by_id uuid references public.customers (id) on delete set null,
  stripe_customer_id text unique,
  marketing_opt_in boolean not null default false,
  sms_opt_in boolean not null default false,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists customers_email_lower_key on public.customers (lower(email));

create table if not exists public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  author_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists customer_notes_customer_idx on public.customer_notes (customer_id, created_at desc);

-- Team -------------------------------------------------------------------------------
create table if not exists public.photographers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users (id) on delete set null,
  name text not null,
  email text,
  phone text,
  color text not null default '#d9b98c',
  bio text,
  avatar_url text,
  skills text[] not null default '{}',
  max_shoots_per_day integer check (max_shoots_per_day is null or max_shoots_per_day > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service areas / travel zones -----------------------------------------------------
create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  market text,
  kind text not null default 'additional' check (kind in ('primary', 'additional', 'travel_zone')),
  state text,
  cities text[] not null default '{}',
  postal_codes text[] not null default '{}',
  center_latitude double precision,
  center_longitude double precision,
  radius_miles numeric(7, 1),
  travel_fee_cents integer not null default 0 check (travel_fee_cents >= 0),
  per_mile_cents integer not null default 0 check (per_mile_cents >= 0),
  free_miles numeric(7, 1) not null default 0 check (free_miles >= 0),
  priority integer not null default 100,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Catalog: services, packages, add-ons -------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  category text not null check (category in (
    'photography', 'video', 'drone', 'tour', 'floor_plan', 'editing', 'web', 'marketing', 'branding'
  )),
  tagline text,
  description text,
  features text[] not null default '{}',
  icon text,
  image_url text,
  gallery jsonb not null default '[]'::jsonb,
  pricing_model text not null default 'flat' check (pricing_model in ('flat', 'sqft', 'per_unit')),
  base_price_cents integer not null default 0 check (base_price_cents >= 0),
  price_tiers jsonb not null default '[]'::jsonb,
  unit_label text,
  max_quantity integer check (max_quantity is null or max_quantity > 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  turnaround_hours integer check (turnaround_hours is null or turnaround_hours >= 0),
  -- { daylight_only, twilight, min_notice_hours, requires_skill }
  scheduling_rules jsonb not null default '{}'::jsonb,
  is_bookable boolean not null default true,
  is_addon_eligible boolean not null default true,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  tagline text,
  description text,
  features text[] not null default '{}',
  base_price_cents integer not null default 0 check (base_price_cents >= 0),
  price_tiers jsonb not null default '[]'::jsonb,
  badge text,
  image_url text,
  turnaround_text text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_services (
  package_id uuid not null references public.packages (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  primary key (package_id, service_id)
);
create index if not exists package_services_service_idx on public.package_services (service_id);

create table if not exists public.add_ons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  description text,
  -- When set, choosing this add-on adds that service to the order.
  service_id uuid references public.services (id) on delete cascade,
  pricing_model text not null default 'flat' check (pricing_model in ('flat', 'sqft', 'per_unit')),
  price_cents integer not null default 0 check (price_cents >= 0),
  price_tiers jsonb not null default '[]'::jsonb,
  unit_label text,
  max_quantity integer check (max_quantity is null or max_quantity > 0),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  icon text,
  show_always boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Which selected services make an add-on relevant in the booking flow.
create table if not exists public.add_on_triggers (
  add_on_id uuid not null references public.add_ons (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (add_on_id, service_id)
);
create index if not exists add_on_triggers_service_idx on public.add_on_triggers (service_id);

-- Discounts & referrals ------------------------------------------------------------
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code ~ '^[A-Z0-9_-]{3,40}$'),
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_subtotal_cents integer not null default 0 check (min_subtotal_cents >= 0),
  max_discount_cents integer check (max_discount_cents is null or max_discount_cents > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  per_customer_limit integer check (per_customer_limit is null or per_customer_limit > 0),
  customer_id uuid references public.customers (id) on delete cascade,
  first_booking_only boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'referral_reward')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);
create unique index if not exists promo_codes_code_key on public.promo_codes (code);
create index if not exists promo_codes_customer_idx on public.promo_codes (customer_id) where customer_id is not null;

-- Properties & bookings -------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  latitude double precision,
  longitude double precision,
  property_type text not null default 'single_family' check (property_type in (
    'single_family', 'condo', 'townhome', 'multi_family', 'luxury', 'land', 'commercial', 'rental', 'other'
  )),
  square_feet integer check (square_feet is null or (square_feet > 0 and square_feet < 500000)),
  bedrooms numeric(4, 1) check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms is null or bathrooms >= 0),
  mls_number text,
  listing_status text check (listing_status in ('coming_soon', 'active', 'pending', 'sold', 'for_rent', 'not_listed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists properties_customer_idx on public.properties (customer_id);

create sequence if not exists public.booking_number_seq start with 1001;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  property_id uuid not null references public.properties (id) on delete restrict,
  package_id uuid references public.packages (id) on delete set null,
  status text not null default 'requested' check (status in (
    'requested', 'confirmed', 'scheduled', 'shoot_completed', 'editing', 'ready_for_delivery', 'delivered', 'cancelled'
  )),
  source text not null default 'online' check (source in ('online', 'admin', 'phone', 'email')),
  preferred_date date,
  arrival_window text,
  occupancy text check (occupancy in ('occupied', 'vacant')),
  listing_status text,
  access_instructions text,
  special_instructions text,
  currency text not null default 'usd',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  travel_fee_cents integer not null default 0 check (travel_fee_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  amount_paid_cents integer not null default 0,
  amount_refunded_cents integer not null default 0,
  payment_option text not null default 'full' check (payment_option in ('full', 'deposit', 'later')),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'pending', 'deposit_paid', 'paid', 'partially_refunded', 'refunded'
  )),
  promo_code_id uuid references public.promo_codes (id) on delete set null,
  discount_label text,
  service_area_id uuid references public.service_areas (id) on delete set null,
  travel_distance_miles numeric(7, 1),
  estimated_duration_minutes integer,
  share_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  website_enabled boolean not null default false,
  confirmed_at timestamptz,
  completed_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index if not exists bookings_property_idx on public.bookings (property_id);
create index if not exists bookings_status_idx on public.bookings (status, created_at desc);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

-- Order line items (packages, services, add-ons, custom fees)
create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  item_type text not null check (item_type in ('package', 'service', 'add_on', 'fee')),
  service_id uuid references public.services (id) on delete set null,
  package_id uuid references public.packages (id) on delete set null,
  add_on_id uuid references public.add_ons (id) on delete set null,
  name text not null,
  description text,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null default 0 check (unit_price_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  included_in_package boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists booking_services_booking_idx on public.booking_services (booking_id, sort_order);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  photographer_id uuid references public.photographers (id) on delete set null,
  kind text not null default 'shoot' check (kind in ('shoot', 'twilight', 'tour', 'drone', 'other')),
  status text not null default 'scheduled' check (status in ('held', 'scheduled', 'completed', 'cancelled', 'no_show')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hold_expires_at timestamptz,
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes >= 0),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes >= 0),
  notes text,
  external_calendar_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- A photographer can never be double-booked.
  constraint appointments_photographer_no_overlap exclude using gist (
    photographer_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('held', 'scheduled') and photographer_id is not null)
);
create index if not exists appointments_starts_idx on public.appointments (starts_at);
create index if not exists appointments_booking_idx on public.appointments (booking_id);
create index if not exists appointments_photographer_idx on public.appointments (photographer_id, starts_at);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid references public.photographers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists schedule_blocks_range_idx on public.schedule_blocks (starts_at, ends_at);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  type text not null check (type in (
    'created', 'status_change', 'note', 'message', 'payment', 'schedule', 'media', 'delivery', 'system'
  )),
  visibility text not null default 'internal' check (visibility in ('internal', 'customer')),
  message text not null default '',
  meta jsonb not null default '{}'::jsonb,
  actor_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists booking_events_booking_idx on public.booking_events (booking_id, created_at desc);

-- Billing ---------------------------------------------------------------------------
create sequence if not exists public.invoice_number_seq start with 1001;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  booking_id uuid references public.bookings (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'uncollectible')),
  currency text not null default 'usd',
  line_items jsonb not null default '[]'::jsonb,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  travel_fee_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0 check (total_cents >= 0),
  amount_paid_cents integer not null default 0,
  amount_due_cents integer generated always as (greatest(total_cents - amount_paid_cents, 0)) stored,
  due_date date,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  last_reminder_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists invoices_one_active_per_booking on public.invoices (booking_id) where status <> 'void';
create index if not exists invoices_customer_idx on public.invoices (customer_id, issued_at desc);
create index if not exists invoices_status_idx on public.invoices (status, due_date);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  invoice_id uuid references public.invoices (id) on delete set null,
  customer_id uuid references public.customers (id) on delete set null,
  kind text not null check (kind in ('deposit', 'full', 'balance', 'manual')),
  method text not null default 'card' check (method in ('card', 'cash', 'check', 'ach', 'zelle', 'venmo', 'other')),
  provider text not null default 'stripe' check (provider in ('stripe', 'manual')),
  status text not null default 'pending' check (status in (
    'pending', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'
  )),
  amount_cents integer not null check (amount_cents >= 0),
  refunded_cents integer not null default 0 check (refunded_cents >= 0),
  currency text not null default 'usd',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  receipt_url text,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (refunded_cents <= amount_cents)
);
create index if not exists payments_booking_idx on public.payments (booking_id);
create index if not exists payments_customer_idx on public.payments (customer_id, created_at desc);
create index if not exists payments_intent_idx on public.payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_codes (id) on delete cascade,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  amount_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique (promo_code_id, booking_id)
);
create index if not exists promo_redemptions_customer_idx on public.promo_redemptions (promo_code_id, customer_id);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.customers (id) on delete cascade,
  referred_customer_id uuid unique references public.customers (id) on delete set null,
  referred_email text,
  booking_id uuid references public.bookings (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'qualified', 'rewarded', 'void')),
  referee_discount_cents integer not null default 0,
  reward_cents integer not null default 0,
  reward_promo_code_id uuid references public.promo_codes (id) on delete set null,
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (referred_customer_id is null or referred_customer_id <> referrer_id)
);
create index if not exists referrals_referrer_idx on public.referrals (referrer_id, created_at desc);

create table if not exists public.customer_favorites (
  customer_id uuid not null references public.customers (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, service_id)
);

-- Media delivery ------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  category text not null check (category in ('photos', 'videos', 'drone', 'floor_plans', 'tours', 'documents')),
  storage_path text,
  external_url text,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  width integer,
  height integer,
  duration_seconds numeric,
  title text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null)
);
create index if not exists media_booking_idx on public.media (booking_id, category, sort_order);
create unique index if not exists media_storage_path_key on public.media (storage_path) where storage_path is not null;

-- Marketing content ----------------------------------------------------------------------
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  neighborhood text,
  city text,
  state text,
  property_type text,
  categories text[] not null default '{}',
  description text,
  services_performed text[] not null default '{}',
  cover_image_url text,
  video_url text,
  tour_url text,
  booking_id uuid references public.bookings (id) on delete set null,
  shot_on date,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  -- Sample content is hidden in production unless SHOW_SAMPLE_CONTENT=true.
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.portfolio_projects (id) on delete cascade,
  kind text not null default 'photo' check (kind in ('photo', 'video', 'drone')),
  url text not null,
  poster_url text,
  alt text,
  caption text,
  width integer,
  height integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists portfolio_media_project_idx on public.portfolio_media (project_id, sort_order);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_title text,
  company text,
  quote text not null,
  rating smallint check (rating between 1 and 5),
  avatar_url text,
  customer_id uuid references public.customers (id) on delete set null,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leads & notifications --------------------------------------------------------------------
create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  reason text not null default 'general' check (reason in (
    'booking', 'pricing', 'custom_quote', 'partnership', 'support', 'general'
  )),
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  customer_id uuid references public.customers (id) on delete set null,
  source_path text,
  user_agent text,
  ip_hash text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_leads_status_idx on public.contact_leads (status, created_at desc);
create index if not exists contact_leads_ip_idx on public.contact_leads (ip_hash, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'sms', 'in_app')),
  template text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  recipient text not null,
  subject text,
  customer_id uuid references public.customers (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  provider text,
  provider_message_id text,
  error text,
  payload jsonb not null default '{}'::jsonb,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_booking_idx on public.notifications (booking_id, template);
create index if not exists notifications_created_idx on public.notifications (created_at desc);

-- Stripe webhook idempotency
create table if not exists public.webhook_events (
  id text primary key,
  provider text not null default 'stripe',
  type text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at triggers --------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'business_settings', 'users', 'customers', 'photographers', 'service_areas', 'services', 'packages',
    'add_ons', 'promo_codes', 'properties', 'bookings', 'appointments', 'invoices', 'payments',
    'referrals', 'portfolio_projects', 'testimonials', 'contact_leads'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 20260929000200_functions.sql
-- ---------------------------------------------------------------------------

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

drop trigger if exists on_auth_user_created on auth.users;
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

drop trigger if exists on_auth_user_email_changed on auth.users;
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

drop trigger if exists assign_order_number on public.bookings;
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

drop trigger if exists assign_invoice_number on public.invoices;
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

drop trigger if exists assign_referral_code on public.customers;
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

drop trigger if exists normalize_promo_code on public.promo_codes;
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

-- ---------------------------------------------------------------------------
-- 20260929000300_security.sql
-- ---------------------------------------------------------------------------

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
      execute format('drop policy if exists "Admins have full access" on public.%I', t);
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
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services" on public.services
  for select to anon, authenticated using (is_active);
drop policy if exists "Public can read active packages" on public.packages;

create policy "Public can read active packages" on public.packages
  for select to anon, authenticated using (is_active);
drop policy if exists "Public can read package contents" on public.package_services;

create policy "Public can read package contents" on public.package_services
  for select to anon, authenticated using (
    exists (select 1 from public.packages p where p.id = package_id and p.is_active)
  );
drop policy if exists "Public can read active add-ons" on public.add_ons;

create policy "Public can read active add-ons" on public.add_ons
  for select to anon, authenticated using (is_active);
drop policy if exists "Public can read add-on triggers" on public.add_on_triggers;

create policy "Public can read add-on triggers" on public.add_on_triggers
  for select to anon, authenticated using (true);
drop policy if exists "Public can read active service areas" on public.service_areas;

create policy "Public can read active service areas" on public.service_areas
  for select to anon, authenticated using (is_active);
drop policy if exists "Public can read published projects" on public.portfolio_projects;

create policy "Public can read published projects" on public.portfolio_projects
  for select to anon, authenticated using (is_published);
drop policy if exists "Public can read published project media" on public.portfolio_media;

create policy "Public can read published project media" on public.portfolio_media
  for select to anon, authenticated using (
    exists (select 1 from public.portfolio_projects p where p.id = project_id and p.is_published)
  );
drop policy if exists "Public can read published testimonials" on public.testimonials;

create policy "Public can read published testimonials" on public.testimonials
  for select to anon, authenticated using (is_published);

-- Signed-in users: their own profile --------------------------------------------------
drop policy if exists "Users read own profile" on public.users;
create policy "Users read own profile" on public.users
  for select to authenticated using (id = (select auth.uid()));
drop policy if exists "Users update own profile" on public.users;

create policy "Users update own profile" on public.users
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
drop policy if exists "Users see own admin membership" on public.admins;

create policy "Users see own admin membership" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- Customers: read-only access to their own records --------------------------------------
drop policy if exists "Customers read own record" on public.customers;
create policy "Customers read own record" on public.customers
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Customers read own properties" on public.properties;

create policy "Customers read own properties" on public.properties
  for select to authenticated using (customer_id = (select public.current_customer_id()));
drop policy if exists "Customers read own bookings" on public.bookings;

create policy "Customers read own bookings" on public.bookings
  for select to authenticated using (customer_id = (select public.current_customer_id()));
drop policy if exists "Customers read own line items" on public.booking_services;

create policy "Customers read own line items" on public.booking_services
  for select to authenticated using (public.owns_booking(booking_id));
drop policy if exists "Customers read own appointments" on public.appointments;

create policy "Customers read own appointments" on public.appointments
  for select to authenticated using (public.owns_booking(booking_id));
drop policy if exists "Customers read customer-visible events" on public.booking_events;

create policy "Customers read customer-visible events" on public.booking_events
  for select to authenticated using (visibility = 'customer' and public.owns_booking(booking_id));
drop policy if exists "Customers read own invoices" on public.invoices;

create policy "Customers read own invoices" on public.invoices
  for select to authenticated using (
    customer_id = (select public.current_customer_id()) and status <> 'draft'
  );
drop policy if exists "Customers read own payments" on public.payments;

create policy "Customers read own payments" on public.payments
  for select to authenticated using (customer_id = (select public.current_customer_id()));

-- Media becomes visible to the client only once the order is delivered.
drop policy if exists "Customers read delivered media" on public.media;
create policy "Customers read delivered media" on public.media
  for select to authenticated using (is_visible and public.owns_booking(booking_id, true));
drop policy if exists "Customers read own referrals" on public.referrals;

create policy "Customers read own referrals" on public.referrals
  for select to authenticated using (referrer_id = (select public.current_customer_id()));
drop policy if exists "Customers read own reward codes" on public.promo_codes;

create policy "Customers read own reward codes" on public.promo_codes
  for select to authenticated using (customer_id = (select public.current_customer_id()));
drop policy if exists "Customers read own favorites" on public.customer_favorites;

create policy "Customers read own favorites" on public.customer_favorites
  for select to authenticated using (customer_id = (select public.current_customer_id()));
drop policy if exists "Customers add own favorites" on public.customer_favorites;

create policy "Customers add own favorites" on public.customer_favorites
  for insert to authenticated with check (customer_id = (select public.current_customer_id()));
drop policy if exists "Customers remove own favorites" on public.customer_favorites;

create policy "Customers remove own favorites" on public.customer_favorites
  for delete to authenticated using (customer_id = (select public.current_customer_id()));

-- Photographers (foundation for a future crew app) -------------------------------------------
drop policy if exists "Photographers read own profile" on public.photographers;
create policy "Photographers read own profile" on public.photographers
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Photographers read assigned appointments" on public.appointments;

create policy "Photographers read assigned appointments" on public.appointments
  for select to authenticated using (photographer_id = (select public.current_photographer_id()));
drop policy if exists "Photographers read assigned bookings" on public.bookings;

create policy "Photographers read assigned bookings" on public.bookings
  for select to authenticated using (public.is_assigned_to_booking(id));
drop policy if exists "Photographers read assigned properties" on public.properties;

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

-- ---------------------------------------------------------------------------
-- 20260929000400_storage.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- Jennings Media — Storage buckets
--   deliveries   : private. Client media. Customers download through short-lived
--                  signed URLs minted by the server after an ownership check.
--   public-media : public. Portfolio, service imagery, hero video, avatars.
-- Uploads use signed upload URLs issued to admins by the server, so large files
-- go straight from the browser to Storage (never through a serverless function).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('deliveries', 'deliveries', false, 5368709120),
  ('public-media', 'public-media', true, 524288000)
on conflict (id) do nothing;
drop policy if exists "Admins manage delivery files" on storage.objects;

create policy "Admins manage delivery files" on storage.objects
  for all to authenticated
  using (bucket_id = 'deliveries' and (select public.is_admin()))
  with check (bucket_id = 'deliveries' and (select public.is_admin()));
drop policy if exists "Admins manage public media" on storage.objects;

create policy "Admins manage public media" on storage.objects
  for all to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()))
  with check (bucket_id = 'public-media' and (select public.is_admin()));
drop policy if exists "Anyone can read public media" on storage.objects;

create policy "Anyone can read public media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-media');

-- ---------------------------------------------------------------------------
-- 20260929000500_agency.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- Agency repositioning: case studies, client logos, project inquiries, stats
-- =============================================================================

-- Case-study fields on portfolio projects (the agency "Work" section).
alter table public.portfolio_projects
  add column if not exists client_name text,
  add column if not exists industry text,
  add column if not exists year integer check (year is null or year between 1990 and 2100),
  add column if not exists headline text,
  add column if not exists summary text,
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists challenge text,
  add column if not exists strategy text,
  add column if not exists execution text,
  add column if not exists results text,
  add column if not exists hover_video_url text,
  add column if not exists testimonial_quote text,
  add column if not exists testimonial_author text,
  add column if not exists testimonial_role text;

-- Client logos for the trust marquee.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  -- Sample content is hidden in production unless SHOW_SAMPLE_CONTENT=true.
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
drop policy if exists "Admins have full access" on public.clients;
create policy "Admins have full access" on public.clients
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Public can read published clients" on public.clients;
create policy "Public can read published clients" on public.clients
  for select to anon, authenticated using (is_published);
grant select on public.clients to anon, authenticated;
grant insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
revoke insert, update, delete, truncate on public.clients from anon;

-- Project inquiries from the agency contact form.
alter table public.contact_leads
  add column if not exists need text,
  add column if not exists services text[] not null default '{}',
  add column if not exists budget text;
alter table public.contact_leads drop constraint if exists contact_leads_reason_check;
alter table public.contact_leads add constraint contact_leads_reason_check check (reason in (
  'project', 'booking', 'pricing', 'custom_quote', 'partnership', 'support', 'general'
));

-- Marketing site content managed from Admin → Settings → Website
-- { stats: [{prefix, value, suffix, label}], stats_are_sample, trust_line }
alter table public.business_settings
  add column if not exists marketing jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 20261104000100_creator_applicants.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- Creator network: photographers and videographers who apply through /join
-- =============================================================================
-- Rows are written by the server (service role) from the /join form and read or
-- updated only by admins (Admin → Creators). Visitors never touch the table directly.

create table if not exists public.creator_applicants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  discipline text not null check (discipline in ('photo', 'video', 'both')),
  portfolio_url text not null,
  gear text,
  -- Whole US dollars per day, as typed by the applicant.
  day_rate integer check (day_rate is null or day_rate between 0 and 100000),
  availability text,
  notes text,
  status text not null default 'applied' check (status in ('applied', 'contacted', 'trial_shoot', 'active', 'no')),
  admin_notes text,
  source_path text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists creator_applicants_status_idx on public.creator_applicants (status, created_at desc);
create index if not exists creator_applicants_ip_idx on public.creator_applicants (ip_hash, created_at desc);
create index if not exists creator_applicants_email_idx on public.creator_applicants (lower(email));

drop trigger if exists creator_applicants_updated_at on public.creator_applicants;
create trigger creator_applicants_updated_at
  before update on public.creator_applicants
  for each row execute function public.set_updated_at();

alter table public.creator_applicants enable row level security;
drop policy if exists "Admins have full access" on public.creator_applicants;
create policy "Admins have full access" on public.creator_applicants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant all on public.creator_applicants to service_role;
grant select, insert, update, delete on public.creator_applicants to authenticated;
revoke all on public.creator_applicants from anon;

-- ---------------------------------------------------------------------------
-- 20261114000100_creator_areas.sql
-- ---------------------------------------------------------------------------

-- =============================================================================
-- Creator network: the areas an applicant covers (asked on /join)
-- =============================================================================
-- Free text, as typed ("Tampa, St. Pete, Clearwater"). Safe to run more than once.
-- Until this is applied the site still saves applications: it writes the areas into
-- the notes instead.

alter table public.creator_applicants add column if not exists areas text;
