/**
 * Domain types mirroring the Supabase schema (supabase/migrations).
 * Money is always integer cents; timestamps are ISO strings.
 */

export const BOOKING_STATUSES = [
  "requested",
  "confirmed",
  "scheduled",
  "shoot_completed",
  "editing",
  "ready_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_OPTIONS = ["full", "deposit", "later"] as const;
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "deposit_paid"
  | "paid"
  | "partially_refunded"
  | "refunded";

export const SERVICE_CATEGORIES = [
  "photography",
  "video",
  "drone",
  "tour",
  "floor_plan",
  "editing",
  "web",
  "marketing",
  "branding",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type PricingModel = "flat" | "sqft" | "per_unit";

/** A size tier: applies when square footage <= max_sqft (null = everything above). */
export interface PriceTier {
  max_sqft: number | null;
  price_cents: number;
}

export interface SchedulingRules {
  /** Must finish before sunset (drone, exteriors). */
  daylight_only?: boolean;
  /** Scheduled around sunset; forces a twilight time slot. */
  twilight?: boolean;
  /** Extra lead time required, e.g. for 3D scanning equipment. */
  min_notice_hours?: number;
  /** Photographer skill required (matches photographers.skills). */
  requires_skill?: string;
}

export interface MediaExample {
  url: string;
  alt?: string;
  kind?: "image" | "video";
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  tagline: string | null;
  description: string | null;
  features: string[];
  icon: string | null;
  image_url: string | null;
  gallery: MediaExample[];
  pricing_model: PricingModel;
  base_price_cents: number;
  price_tiers: PriceTier[];
  unit_label: string | null;
  max_quantity: number | null;
  duration_minutes: number;
  turnaround_hours: number | null;
  scheduling_rules: SchedulingRules;
  is_bookable: boolean;
  is_addon_eligible: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
}

export interface Package {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  features: string[];
  base_price_cents: number;
  price_tiers: PriceTier[];
  badge: string | null;
  image_url: string | null;
  turnaround_text: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  /** Joined from package_services. */
  services: { service_id: string; quantity: number }[];
}

export interface AddOn {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  service_id: string | null;
  pricing_model: PricingModel;
  price_cents: number;
  price_tiers: PriceTier[];
  unit_label: string | null;
  max_quantity: number | null;
  duration_minutes: number;
  icon: string | null;
  show_always: boolean;
  is_active: boolean;
  sort_order: number;
  /** Joined from add_on_triggers: services that make this add-on relevant. */
  trigger_service_ids: string[];
}

export interface Catalog {
  services: Service[];
  packages: Package[];
  addOns: AddOn[];
}

export interface WorkingInterval {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface SchedulingSettings {
  /** Keyed by weekday: "0" = Sunday … "6" = Saturday. */
  working_hours: Record<string, WorkingInterval[]>;
  slot_interval_minutes: number;
  max_shoots_per_day: number;
  travel_buffer_minutes: number;
  default_duration_minutes: number;
  min_notice_hours: number;
  max_advance_days: number;
  hold_minutes: number;
  /** Minutes before sunset a twilight shoot starts. */
  twilight_lead_minutes: number;
}

export interface PaymentSettings {
  allow_full: boolean;
  allow_deposit: boolean;
  allow_pay_later: boolean;
  deposit_type: "percent" | "fixed";
  deposit_value: number;
  pay_later_note: string;
}

export interface ReferralSettings {
  enabled: boolean;
  referrer_reward_cents: number;
  referee_discount_type: "percent" | "fixed";
  referee_discount_value: number;
  qualify_on: "paid" | "delivered";
}

export interface NotificationSettings {
  admin_emails: string[];
  reminder_hours_before: number;
  sms_enabled: boolean;
  reply_to: string;
}

export interface AnalyticsSettings {
  ga4_id: string;
  meta_pixel_id: string;
  google_ads_id: string;
  google_ads_booking_label: string;
}

export interface ServiceAreaPolicy {
  outside_area_policy: "quote" | "reject";
  outside_area_fee_cents: number;
  road_distance_factor: number;
}

export interface BusinessSettings {
  business_name: string;
  legal_name: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  currency: string;
  tax_rate_bps: number;
  tax_label: string;
  tax_travel_fee: boolean;
  payment_options: PaymentSettings;
  scheduling: SchedulingSettings;
  referral_program: ReferralSettings;
  notifications: NotificationSettings;
  analytics: AnalyticsSettings;
  social_links: Partial<Record<"instagram" | "facebook" | "youtube" | "tiktok" | "linkedin", string>>;
  service_area_policy: ServiceAreaPolicy;
  hero_video_url: string | null;
  hero_image_url: string | null;
}

export interface ServiceArea {
  id: string;
  name: string;
  market: string | null;
  kind: "primary" | "additional" | "travel_zone";
  state: string | null;
  cities: string[];
  postal_codes: string[];
  center_latitude: number | null;
  center_longitude: number | null;
  radius_miles: number | null;
  travel_fee_cents: number;
  per_mile_cents: number;
  free_miles: number;
  priority: number;
  is_active: boolean;
  notes: string | null;
}

export interface Photographer {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  color: string;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  max_shoots_per_day: number | null;
  is_active: boolean;
}

export interface Customer {
  id: string;
  user_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  company: string | null;
  brokerage: string | null;
  license_number: string | null;
  billing_address: BillingAddress | null;
  referral_code: string | null;
  referred_by_id: string | null;
  stripe_customer_id: string | null;
  marketing_opt_in: boolean;
  sms_opt_in: boolean;
  tags: string[];
  created_at: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhome"
  | "multi_family"
  | "luxury"
  | "land"
  | "commercial"
  | "rental"
  | "other";

export interface Property {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  property_type: PropertyType;
  square_feet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  mls_number: string | null;
  listing_status: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  order_number: string;
  customer_id: string;
  property_id: string;
  package_id: string | null;
  status: BookingStatus;
  source: string;
  preferred_date: string | null;
  arrival_window: string | null;
  occupancy: "occupied" | "vacant" | null;
  listing_status: string | null;
  access_instructions: string | null;
  special_instructions: string | null;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  travel_fee_cents: number;
  tax_cents: number;
  total_cents: number;
  deposit_cents: number;
  amount_paid_cents: number;
  amount_refunded_cents: number;
  payment_option: PaymentOption;
  payment_status: PaymentStatus;
  promo_code_id: string | null;
  discount_label: string | null;
  service_area_id: string | null;
  travel_distance_miles: number | null;
  estimated_duration_minutes: number | null;
  share_token: string;
  website_enabled: boolean;
  confirmed_at: string | null;
  completed_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type LineItemType = "package" | "service" | "add_on" | "fee";

export interface BookingLineItem {
  id: string;
  booking_id: string;
  item_type: LineItemType;
  service_id: string | null;
  package_id: string | null;
  add_on_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  included_in_package: boolean;
  sort_order: number;
}

export type AppointmentStatus = "held" | "scheduled" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  booking_id: string;
  photographer_id: string | null;
  kind: "shoot" | "twilight" | "tour" | "drone" | "other";
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string;
  hold_expires_at: string | null;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  notes: string | null;
}

export interface ScheduleBlock {
  id: string;
  photographer_id: string | null;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  reason: string | null;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  booking_id: string | null;
  customer_id: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  currency: string;
  line_items: InvoiceLine[];
  subtotal_cents: number;
  discount_cents: number;
  travel_fee_cents: number;
  tax_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  amount_due_cents: number;
  due_date: string | null;
  issued_at: string;
  paid_at: string | null;
  last_reminder_at: string | null;
  notes: string | null;
}

export interface InvoiceLine {
  name: string;
  description?: string | null;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  included?: boolean;
}

export interface Payment {
  id: string;
  booking_id: string | null;
  invoice_id: string | null;
  customer_id: string | null;
  kind: "deposit" | "full" | "balance" | "manual";
  method: "card" | "cash" | "check" | "ach" | "zelle" | "venmo" | "other";
  provider: "stripe" | "manual";
  status: "pending" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";
  amount_cents: number;
  refunded_cents: number;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  receipt_url: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
}

export const MEDIA_CATEGORIES = ["photos", "videos", "drone", "floor_plans", "tours", "documents"] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export interface MediaItem {
  id: string;
  booking_id: string;
  category: MediaCategory;
  storage_path: string | null;
  external_url: string | null;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  title: string | null;
  sort_order: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
}

export const PORTFOLIO_CATEGORIES = [
  "photography",
  "video",
  "drone",
  "twilight",
  "luxury",
  "residential",
  "commercial",
] as const;
export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export interface PortfolioMedia {
  id: string;
  kind: "photo" | "video" | "drone";
  url: string;
  poster_url: string | null;
  alt: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  property_type: string | null;
  categories: PortfolioCategory[];
  description: string | null;
  services_performed: string[];
  cover_image_url: string | null;
  video_url: string | null;
  tour_url: string | null;
  shot_on: string | null;
  is_featured: boolean;
  is_published: boolean;
  is_sample: boolean;
  sort_order: number;
  media: PortfolioMedia[];
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title: string | null;
  company: string | null;
  quote: string;
  rating: number | null;
  avatar_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  is_sample: boolean;
  sort_order: number;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_subtotal_cents: number;
  max_discount_cents: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  usage_count: number;
  per_customer_limit: number | null;
  customer_id: string | null;
  first_booking_only: boolean;
  source: "manual" | "referral_reward";
  is_active: boolean;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_customer_id: string | null;
  referred_email: string | null;
  booking_id: string | null;
  status: "pending" | "qualified" | "rewarded" | "void";
  referee_discount_cents: number;
  reward_cents: number;
  reward_promo_code_id: string | null;
  qualified_at: string | null;
  rewarded_at: string | null;
  created_at: string;
}

export type LeadReason = "booking" | "pricing" | "custom_quote" | "partnership" | "support" | "general";

export interface ContactLead {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  reason: LeadReason;
  message: string;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "spam";
  customer_id: string | null;
  source_path: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface BookingEvent {
  id: string;
  booking_id: string;
  type:
    | "created"
    | "status_change"
    | "note"
    | "message"
    | "payment"
    | "schedule"
    | "media"
    | "delivery"
    | "system";
  visibility: "internal" | "customer";
  message: string;
  meta: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  channel: "email" | "sms" | "in_app";
  template: string;
  status: "queued" | "sent" | "failed" | "skipped";
  recipient: string;
  subject: string | null;
  booking_id: string | null;
  error: string | null;
  created_at: string;
  sent_at: string | null;
}

/** Result type for Server Actions. */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
