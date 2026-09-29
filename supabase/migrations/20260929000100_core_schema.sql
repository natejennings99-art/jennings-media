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
create table public.business_settings (
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
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customers (CRM record; may exist before the person creates a login) -----------
create table public.customers (
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
create unique index customers_email_lower_key on public.customers (lower(email));

create table public.customer_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  body text not null check (length(body) between 1 and 5000),
  author_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index customer_notes_customer_idx on public.customer_notes (customer_id, created_at desc);

-- Team -------------------------------------------------------------------------------
create table public.photographers (
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
create table public.service_areas (
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
create table public.services (
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

create table public.packages (
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

create table public.package_services (
  package_id uuid not null references public.packages (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  primary key (package_id, service_id)
);
create index package_services_service_idx on public.package_services (service_id);

create table public.add_ons (
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
create table public.add_on_triggers (
  add_on_id uuid not null references public.add_ons (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  primary key (add_on_id, service_id)
);
create index add_on_triggers_service_idx on public.add_on_triggers (service_id);

-- Discounts & referrals ------------------------------------------------------------
create table public.promo_codes (
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
create unique index promo_codes_code_key on public.promo_codes (code);
create index promo_codes_customer_idx on public.promo_codes (customer_id) where customer_id is not null;

-- Properties & bookings -------------------------------------------------------------
create table public.properties (
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
create index properties_customer_idx on public.properties (customer_id);

create sequence public.booking_number_seq start with 1001;

create table public.bookings (
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
create index bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index bookings_property_idx on public.bookings (property_id);
create index bookings_status_idx on public.bookings (status, created_at desc);
create index bookings_created_idx on public.bookings (created_at desc);

-- Order line items (packages, services, add-ons, custom fees)
create table public.booking_services (
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
create index booking_services_booking_idx on public.booking_services (booking_id, sort_order);

create table public.appointments (
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
create index appointments_starts_idx on public.appointments (starts_at);
create index appointments_booking_idx on public.appointments (booking_id);
create index appointments_photographer_idx on public.appointments (photographer_id, starts_at);

create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  photographer_id uuid references public.photographers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index schedule_blocks_range_idx on public.schedule_blocks (starts_at, ends_at);

create table public.booking_events (
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
create index booking_events_booking_idx on public.booking_events (booking_id, created_at desc);

-- Billing ---------------------------------------------------------------------------
create sequence public.invoice_number_seq start with 1001;

create table public.invoices (
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
create unique index invoices_one_active_per_booking on public.invoices (booking_id) where status <> 'void';
create index invoices_customer_idx on public.invoices (customer_id, issued_at desc);
create index invoices_status_idx on public.invoices (status, due_date);

create table public.payments (
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
create index payments_booking_idx on public.payments (booking_id);
create index payments_customer_idx on public.payments (customer_id, created_at desc);
create index payments_intent_idx on public.payments (stripe_payment_intent_id) where stripe_payment_intent_id is not null;

create table public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_codes (id) on delete cascade,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  amount_cents integer not null default 0,
  created_at timestamptz not null default now(),
  unique (promo_code_id, booking_id)
);
create index promo_redemptions_customer_idx on public.promo_redemptions (promo_code_id, customer_id);

create table public.referrals (
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
create index referrals_referrer_idx on public.referrals (referrer_id, created_at desc);

create table public.customer_favorites (
  customer_id uuid not null references public.customers (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, service_id)
);

-- Media delivery ------------------------------------------------------------------------
create table public.media (
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
create index media_booking_idx on public.media (booking_id, category, sort_order);
create unique index media_storage_path_key on public.media (storage_path) where storage_path is not null;

-- Marketing content ----------------------------------------------------------------------
create table public.portfolio_projects (
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

create table public.portfolio_media (
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
create index portfolio_media_project_idx on public.portfolio_media (project_id, sort_order);

create table public.testimonials (
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
create table public.contact_leads (
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
create index contact_leads_status_idx on public.contact_leads (status, created_at desc);
create index contact_leads_ip_idx on public.contact_leads (ip_hash, created_at desc);

create table public.notifications (
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
create index notifications_booking_idx on public.notifications (booking_id, template);
create index notifications_created_idx on public.notifications (created_at desc);

-- Stripe webhook idempotency
create table public.webhook_events (
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
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end;
$$;
