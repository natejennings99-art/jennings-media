/**
 * Default catalog, settings and sample content.
 *
 * Single source of truth for:
 *   - supabase/seed.sql   (generated: `npm run db:seed:generate`)
 *   - the offline fallback used when Supabase isn't configured (local preview)
 *
 * Everything here is editable later from the admin dashboard.
 */
import type {
  AddOn,
  BusinessSettings,
  Package,
  PortfolioProject,
  PriceTier,
  Service,
  ServiceArea,
  Testimonial,
} from "@/lib/types";
import { IMAGES } from "./images";

const $ = (dollars: number) => Math.round(dollars * 100);
const tiers = (...pairs: [number | null, number][]): PriceTier[] =>
  pairs.map(([max_sqft, dollars]) => ({ max_sqft, price_cents: $(dollars) }));

/* ----------------------------------------------------------------------------
 * Business settings
 * -------------------------------------------------------------------------- */
export const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: "Jennings Media",
  legal_name: null,
  tagline: "Real estate media that sells the property.",
  email: "hello@jenningsmedia.com",
  phone: null,
  address_line1: null,
  address_line2: null,
  city: "Tampa",
  state: "FL",
  postal_code: null,
  country: "US",
  latitude: 27.9506,
  longitude: -82.4572,
  timezone: "America/New_York",
  currency: "usd",
  tax_rate_bps: 0,
  tax_label: "Sales tax",
  tax_travel_fee: false,
  payment_options: {
    allow_full: true,
    allow_deposit: true,
    allow_pay_later: true,
    deposit_type: "percent",
    deposit_value: 30,
    pay_later_note: "Pay securely online once your media is ready — before download.",
  },
  scheduling: {
    working_hours: {
      "0": [],
      "1": [{ start: "08:00", end: "18:00" }],
      "2": [{ start: "08:00", end: "18:00" }],
      "3": [{ start: "08:00", end: "18:00" }],
      "4": [{ start: "08:00", end: "18:00" }],
      "5": [{ start: "08:00", end: "18:00" }],
      "6": [{ start: "09:00", end: "16:00" }],
    },
    slot_interval_minutes: 30,
    max_shoots_per_day: 6,
    travel_buffer_minutes: 30,
    default_duration_minutes: 60,
    min_notice_hours: 18,
    max_advance_days: 60,
    hold_minutes: 35,
    twilight_lead_minutes: 25,
  },
  referral_program: {
    enabled: true,
    referrer_reward_cents: $(50),
    referee_discount_type: "fixed",
    referee_discount_value: $(25),
    qualify_on: "paid",
  },
  notifications: {
    admin_emails: [],
    reminder_hours_before: 24,
    sms_enabled: false,
    reply_to: "",
  },
  analytics: { ga4_id: "", meta_pixel_id: "", google_ads_id: "", google_ads_booking_label: "" },
  social_links: { instagram: "", facebook: "", youtube: "", tiktok: "", linkedin: "" },
  service_area_policy: {
    outside_area_policy: "quote",
    outside_area_fee_cents: $(75),
    road_distance_factor: 1.25,
  },
  hero_video_url: null,
  hero_image_url: null,
};

/* ----------------------------------------------------------------------------
 * Services
 * -------------------------------------------------------------------------- */
const SID = {
  photography: "5e000000-0000-4000-8000-000000000001",
  dronePhotos: "5e000000-0000-4000-8000-000000000002",
  droneVideo: "5e000000-0000-4000-8000-000000000003",
  cinematic: "5e000000-0000-4000-8000-000000000004",
  reel: "5e000000-0000-4000-8000-000000000005",
  matterport: "5e000000-0000-4000-8000-000000000006",
  floorPlan: "5e000000-0000-4000-8000-000000000007",
  virtualTwilight: "5e000000-0000-4000-8000-000000000008",
  twilight: "5e000000-0000-4000-8000-000000000009",
  website: "5e000000-0000-4000-8000-000000000010",
  marketingKit: "5e000000-0000-4000-8000-000000000011",
  branding: "5e000000-0000-4000-8000-000000000012",
} as const;

type ServiceSeed = Omit<
  Service,
  "gallery" | "is_active" | "is_addon_eligible" | "seo_title" | "seo_description" | "max_quantity" | "unit_label"
> &
  Partial<Pick<Service, "gallery" | "is_addon_eligible" | "max_quantity" | "unit_label">>;

function service(s: ServiceSeed): Service {
  return {
    gallery: [],
    is_addon_eligible: true,
    max_quantity: null,
    unit_label: null,
    ...s,
    is_active: true,
    seo_title: null,
    seo_description: null,
  };
}

export const DEFAULT_SERVICES: Service[] = [
  service({
    id: SID.photography,
    slug: "photography",
    name: "Professional Photography",
    category: "photography",
    tagline: "Bright, true-to-life HDR photos, hand-edited and delivered the next morning.",
    description:
      "Every room is bracketed, blended and edited by hand for balanced windows, straight verticals and accurate color. You get MLS-sized and print-ready files, organized in the order buyers walk the home.",
    features: [
      "25–60 hand-edited HDR images",
      "Window pulls, sky replacement & color correction",
      "MLS-ready and full-resolution print files",
      "Delivered by 9 AM the next morning",
    ],
    icon: "camera",
    image_url: IMAGES.livingBright,
    gallery: [
      { url: IMAGES.kitchenModern, alt: "Bright modern kitchen" },
      { url: IMAGES.bedroomSuite, alt: "Primary suite" },
      { url: IMAGES.bathMarble, alt: "Marble bathroom" },
    ],
    pricing_model: "sqft",
    base_price_cents: $(175),
    price_tiers: tiers([1500, 175], [2500, 199], [3500, 239], [5000, 289], [null, 349]),
    duration_minutes: 75,
    turnaround_hours: 24,
    scheduling_rules: {},
    is_bookable: true,
    is_featured: true,
    sort_order: 10,
  }),
  service({
    id: SID.dronePhotos,
    slug: "drone-photography",
    name: "Drone Photography",
    category: "drone",
    tagline: "FAA Part 107 aerials that show the lot, the views and the neighborhood.",
    description:
      "Elevated and high-altitude angles reveal what ground photos can't: lot size, water and golf views, proximity to amenities. Optional lot-line overlays on request.",
    features: ["10–15 aerial images", "Licensed & insured pilots", "Lot-line overlays available", "Neighborhood context shots"],
    icon: "plane",
    image_url: IMAGES.aerialSuburb,
    gallery: [{ url: IMAGES.aerialCoast, alt: "Coastal aerial" }],
    pricing_model: "flat",
    base_price_cents: $(125),
    price_tiers: [],
    duration_minutes: 20,
    turnaround_hours: 24,
    scheduling_rules: { daylight_only: true, requires_skill: "drone" },
    is_bookable: true,
    is_featured: true,
    sort_order: 20,
  }),
  service({
    id: SID.droneVideo,
    slug: "drone-video",
    name: "Drone Video",
    category: "drone",
    tagline: "Sweeping 4K aerial footage cut into a 60–90 second film.",
    description:
      "Smooth reveals, orbits and fly-throughs of the property and surrounding area, color graded and edited to licensed music. Branded and unbranded (MLS) versions included.",
    features: ["60–90 second edit", "4K, color graded", "Licensed music", "Branded + MLS-unbranded versions"],
    icon: "clapperboard",
    image_url: IMAGES.droneFlying,
    pricing_model: "flat",
    base_price_cents: $(199),
    price_tiers: [],
    duration_minutes: 25,
    turnaround_hours: 48,
    scheduling_rules: { daylight_only: true, requires_skill: "drone" },
    is_bookable: true,
    is_featured: false,
    sort_order: 30,
  }),
  service({
    id: SID.cinematic,
    slug: "cinematic-video",
    name: "Cinematic Property Video",
    category: "video",
    tagline: "A gimbal-shot listing film with story, motion and music.",
    description:
      "A 1–2 minute film shot in 4K on a stabilized gimbal, sequenced like a showing and finished with color grading and licensed music. Optional agent intro on camera.",
    features: ["1–2 minute 4K film", "Gimbal-stabilized motion", "Color grading & licensed music", "Optional agent on-camera intro"],
    icon: "film",
    image_url: IMAGES.videoRig,
    pricing_model: "sqft",
    base_price_cents: $(349),
    price_tiers: tiers([2500, 349], [4000, 425], [null, 525]),
    duration_minutes: 60,
    turnaround_hours: 48,
    scheduling_rules: { requires_skill: "video" },
    is_bookable: true,
    is_featured: true,
    sort_order: 40,
  }),
  service({
    id: SID.reel,
    slug: "social-media-reel",
    name: "Vertical Realtor Reel",
    category: "video",
    tagline: "A scroll-stopping 9:16 reel for Instagram, TikTok and Shorts.",
    description:
      "Fast-paced vertical edits built for social: hook in the first second, captions, trending-style pacing and an optional agent cameo.",
    features: ["30–60 second 9:16 edit", "On-screen captions", "Hook-first pacing", "Ready to post"],
    icon: "smartphone",
    image_url: IMAGES.phoneSocial,
    pricing_model: "flat",
    base_price_cents: $(199),
    price_tiers: [],
    duration_minutes: 30,
    turnaround_hours: 48,
    scheduling_rules: { requires_skill: "video" },
    is_bookable: true,
    is_featured: true,
    sort_order: 50,
  }),
  service({
    id: SID.matterport,
    slug: "matterport-3d-tour",
    name: "Matterport 3D Tour",
    category: "tour",
    tagline: "An immersive walkthrough buyers can explore from anywhere, 24/7.",
    description:
      "A Matterport Pro scan with dollhouse view, floor-plan view and measurement mode. Branded and MLS-compliant unbranded links, hosted for six months.",
    features: ["Dollhouse & floor-plan views", "Branded + unbranded links", "Embeddable anywhere", "Hosted for 6 months"],
    icon: "box",
    image_url: IMAGES.livingModern,
    pricing_model: "sqft",
    base_price_cents: $(199),
    price_tiers: tiers([2000, 199], [3500, 249], [5000, 299], [null, 379]),
    duration_minutes: 60,
    turnaround_hours: 48,
    scheduling_rules: { min_notice_hours: 24, requires_skill: "tour" },
    is_bookable: true,
    is_featured: true,
    sort_order: 60,
  }),
  service({
    id: SID.floorPlan,
    slug: "floor-plans",
    name: "Floor Plans",
    category: "floor_plan",
    tagline: "Accurate 2D plans with room dimensions and total square footage.",
    description:
      "Laser-measured floor plans drawn to scale, with room names, dimensions and total living area. Delivered as high-resolution PNG and PDF.",
    features: ["Laser-measured", "Room dimensions & totals", "PNG + PDF", "Branded or unbranded"],
    icon: "ruler",
    image_url: IMAGES.blueprint,
    pricing_model: "sqft",
    base_price_cents: $(89),
    price_tiers: tiers([2000, 89], [3500, 119], [null, 149]),
    duration_minutes: 20,
    turnaround_hours: 24,
    scheduling_rules: {},
    is_bookable: true,
    is_featured: true,
    sort_order: 70,
  }),
  service({
    id: SID.virtualTwilight,
    slug: "virtual-twilight",
    name: "Virtual Twilight",
    category: "editing",
    tagline: "Turn a daytime exterior into a glowing golden-hour hero shot.",
    description:
      "Our editors convert daytime exteriors into realistic dusk scenes: warm interior glow, dramatic sky and landscape lighting — without a second visit.",
    features: ["Realistic dusk sky", "Warm window glow", "No return visit needed", "Delivered with your photos"],
    icon: "sunset",
    image_url: IMAGES.villaTwilight,
    pricing_model: "per_unit",
    base_price_cents: $(35),
    price_tiers: [],
    unit_label: "image",
    max_quantity: 10,
    duration_minutes: 0,
    turnaround_hours: 24,
    scheduling_rules: {},
    is_bookable: true,
    is_featured: true,
    sort_order: 80,
  }),
  service({
    id: SID.twilight,
    slug: "twilight-photography",
    name: "Twilight Photography",
    category: "photography",
    tagline: "An on-site golden-hour session when the home looks its best.",
    description:
      "We arrive before sunset and capture the exterior (and key interiors) as the sky turns deep blue and the home glows. Scheduled automatically around the day's sunset.",
    features: ["Scheduled around sunset", "8–12 twilight images", "Exterior & key interiors", "Weather-guaranteed reschedule"],
    icon: "moon",
    image_url: IMAGES.exteriorDusk,
    pricing_model: "flat",
    base_price_cents: $(249),
    price_tiers: [],
    duration_minutes: 45,
    turnaround_hours: 24,
    scheduling_rules: { twilight: true },
    is_bookable: true,
    is_featured: false,
    sort_order: 90,
  }),
  service({
    id: SID.website,
    slug: "property-website",
    name: "Property Website",
    category: "web",
    tagline: "A beautiful single-property site with gallery, video, tour and lead capture.",
    description:
      "A mobile-first listing website generated from your delivered media, with a shareable link, QR code for signage and an unbranded version for the MLS.",
    features: ["Gallery, video & 3D tour", "Shareable link + QR code", "Branded & unbranded", "Live within 24 hours"],
    icon: "globe",
    image_url: IMAGES.exteriorModern,
    pricing_model: "flat",
    base_price_cents: $(79),
    price_tiers: [],
    duration_minutes: 0,
    turnaround_hours: 24,
    scheduling_rules: {},
    is_bookable: true,
    is_featured: true,
    sort_order: 100,
  }),
  service({
    id: SID.marketingKit,
    slug: "marketing-kit",
    name: "Marketing Kit",
    category: "marketing",
    tagline: "Flyers, social graphics and ‘Just Listed’ posts, ready to share.",
    description:
      "A designed launch kit built from your listing media: print flyer, feature sheet, Instagram carousel and story graphics, plus ‘Just Listed’ and ‘Under Contract’ posts.",
    features: ["Print flyer & feature sheet", "Social carousel & stories", "Just Listed / Sold posts", "Editable templates"],
    icon: "layout-template",
    image_url: IMAGES.kitchenChef,
    pricing_model: "flat",
    base_price_cents: $(99),
    price_tiers: [],
    duration_minutes: 0,
    turnaround_hours: 48,
    scheduling_rules: {},
    is_bookable: true,
    is_featured: true,
    sort_order: 110,
  }),
  service({
    id: SID.branding,
    slug: "agent-branding",
    name: "Agent Branding Content",
    category: "branding",
    tagline: "Headshots and personal-brand video that make you instantly recognizable.",
    description:
      "Studio-quality headshots, lifestyle portraits and short intro videos for your website, listings and social channels. Custom-quoted for individuals and teams.",
    features: ["Headshots & lifestyle portraits", "Intro & about-me videos", "Team sessions", "Custom quote"],
    icon: "user-round",
    image_url: IMAGES.agentPortrait,
    pricing_model: "flat",
    base_price_cents: $(349),
    price_tiers: [],
    duration_minutes: 90,
    turnaround_hours: 72,
    scheduling_rules: {},
    is_bookable: false,
    is_addon_eligible: false,
    is_featured: false,
    sort_order: 120,
  }),
];

/* ----------------------------------------------------------------------------
 * Packages
 * -------------------------------------------------------------------------- */
export const DEFAULT_PACKAGES: Package[] = [
  {
    id: "9a000000-0000-4000-8000-000000000001",
    slug: "essential",
    name: "Essential",
    tagline: "Everything a listing needs to go live tomorrow.",
    description: "Professional listing photography and a clean floor plan — the essentials, done beautifully.",
    features: ["Professional listing photography", "Basic 2D floor plan", "Next-day delivery", "MLS-ready sizing"],
    base_price_cents: $(250),
    price_tiers: tiers([2500, 250], [3500, 295], [5000, 345], [null, 425]),
    badge: null,
    image_url: IMAGES.livingModern,
    turnaround_text: "Next-day delivery",
    is_featured: false,
    is_active: true,
    sort_order: 10,
    services: [
      { service_id: SID.photography, quantity: 1 },
      { service_id: SID.floorPlan, quantity: 1 },
    ],
  },
  {
    id: "9a000000-0000-4000-8000-000000000002",
    slug: "pro",
    name: "Pro",
    tagline: "Photos, aerials and a full marketing launch in one visit.",
    description: "Our most-booked package: ground and aerial photography, a floor plan, a property website and a ready-to-post marketing kit.",
    features: ["Professional photography", "Drone photography", "Floor plan", "Property website", "Marketing kit"],
    base_price_cents: $(450),
    price_tiers: tiers([2500, 450], [3500, 515], [5000, 595], [null, 725]),
    badge: "Most popular",
    image_url: IMAGES.aerialSuburb,
    turnaround_text: "Photos next day · kit in 48h",
    is_featured: true,
    is_active: true,
    sort_order: 20,
    services: [
      { service_id: SID.photography, quantity: 1 },
      { service_id: SID.dronePhotos, quantity: 1 },
      { service_id: SID.floorPlan, quantity: 1 },
      { service_id: SID.website, quantity: 1 },
      { service_id: SID.marketingKit, quantity: 1 },
    ],
  },
  {
    id: "9a000000-0000-4000-8000-000000000003",
    slug: "signature",
    name: "Signature",
    tagline: "The cinematic launch for listings that deserve a premiere.",
    description: "Everything in Pro plus a cinematic property film and a vertical reel built for social reach.",
    features: [
      "Professional photography",
      "Drone photography",
      "Cinematic property video",
      "Vertical social media reel",
      "Floor plan",
      "Property website",
      "Marketing kit",
    ],
    base_price_cents: $(650),
    price_tiers: tiers([2500, 650], [3500, 750], [5000, 875], [null, 1050]),
    badge: "Best value",
    image_url: IMAGES.villaTwilight,
    turnaround_text: "Photos next day · film in 48h",
    is_featured: false,
    is_active: true,
    sort_order: 30,
    services: [
      { service_id: SID.photography, quantity: 1 },
      { service_id: SID.dronePhotos, quantity: 1 },
      { service_id: SID.cinematic, quantity: 1 },
      { service_id: SID.reel, quantity: 1 },
      { service_id: SID.floorPlan, quantity: 1 },
      { service_id: SID.website, quantity: 1 },
      { service_id: SID.marketingKit, quantity: 1 },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * Add-ons (linked add-ons reuse their service's price)
 * -------------------------------------------------------------------------- */
type AddOnSeed = Pick<AddOn, "id" | "slug" | "name" | "description" | "trigger_service_ids"> & Partial<AddOn>;
function addOn(a: AddOnSeed): AddOn {
  return {
    service_id: null,
    pricing_model: "flat",
    price_cents: 0,
    price_tiers: [],
    unit_label: null,
    max_quantity: null,
    duration_minutes: 0,
    icon: null,
    show_always: false,
    is_active: true,
    sort_order: 0,
    ...a,
  };
}

const AID = (n: number) => `ad000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const DEFAULT_ADD_ONS: AddOn[] = [
  addOn({ id: AID(1), slug: "drone-photos", name: "Drone Photos", description: "Aerial stills of the home, lot and surroundings.", service_id: SID.dronePhotos, icon: "plane", sort_order: 10, trigger_service_ids: [SID.photography, SID.cinematic] }),
  addOn({ id: AID(2), slug: "twilight-shoot", name: "Twilight Photography", description: "Return at golden hour for glowing exteriors.", service_id: SID.twilight, icon: "moon", sort_order: 20, trigger_service_ids: [SID.photography] }),
  addOn({ id: AID(3), slug: "floor-plan", name: "Floor Plan", description: "Measured 2D plan with room dimensions.", service_id: SID.floorPlan, icon: "ruler", sort_order: 30, trigger_service_ids: [SID.photography, SID.matterport] }),
  addOn({ id: AID(4), slug: "virtual-twilight", name: "Virtual Twilight", description: "Day-to-dusk edit of your best exterior.", service_id: SID.virtualTwilight, icon: "sunset", sort_order: 40, trigger_service_ids: [SID.photography, SID.dronePhotos] }),
  addOn({ id: AID(5), slug: "property-website", name: "Property Website", description: "A shareable single-property site.", service_id: SID.website, icon: "globe", sort_order: 50, trigger_service_ids: [SID.photography, SID.cinematic, SID.matterport] }),
  addOn({ id: AID(6), slug: "social-reel", name: "Social Media Reel", description: "A vertical reel ready for Instagram & TikTok.", service_id: SID.reel, icon: "smartphone", sort_order: 60, trigger_service_ids: [SID.photography, SID.cinematic, SID.droneVideo] }),
  addOn({ id: AID(7), slug: "drone-video", name: "Drone Video", description: "4K aerial footage edited to music.", service_id: SID.droneVideo, icon: "clapperboard", sort_order: 70, trigger_service_ids: [SID.cinematic, SID.dronePhotos, SID.reel] }),
  addOn({ id: AID(8), slug: "matterport", name: "Matterport 3D Tour", description: "Immersive 3D walkthrough with dollhouse view.", service_id: SID.matterport, icon: "box", sort_order: 80, trigger_service_ids: [SID.photography, SID.floorPlan] }),
  addOn({ id: AID(9), slug: "marketing-kit", name: "Marketing Kit", description: "Flyers and social graphics from your photos.", service_id: SID.marketingKit, icon: "layout-template", sort_order: 90, trigger_service_ids: [SID.photography] }),
  addOn({ id: AID(10), slug: "additional-photos", name: "Additional Photos", description: "Ten more hand-edited images for larger homes.", pricing_model: "per_unit", price_cents: $(30), unit_label: "set of 10", max_quantity: 5, duration_minutes: 10, icon: "images", sort_order: 100, trigger_service_ids: [SID.photography] }),
  addOn({ id: AID(11), slug: "rush-delivery", name: "Rush Delivery", description: "Same-day delivery for shoots finished before 1 PM.", price_cents: $(75), icon: "zap", show_always: true, sort_order: 110, trigger_service_ids: [] }),
  addOn({ id: AID(12), slug: "key-pickup", name: "Key Pickup", description: "We collect keys from your office and return them.", price_cents: $(25), duration_minutes: 20, icon: "key-round", show_always: true, sort_order: 120, trigger_service_ids: [] }),
];

/* ----------------------------------------------------------------------------
 * Service areas (example market — edit in Admin → Settings → Service areas)
 * -------------------------------------------------------------------------- */
export const DEFAULT_SERVICE_AREAS: ServiceArea[] = [
  {
    id: "5a000000-0000-4000-8000-000000000001",
    name: "Tampa Bay core",
    market: "Tampa Bay",
    kind: "primary",
    state: "FL",
    cities: ["tampa", "st petersburg", "saint petersburg", "clearwater", "brandon", "riverview", "lutz", "largo", "temple terrace", "wesley chapel", "apollo beach", "palm harbor", "dunedin", "oldsmar", "valrico"],
    postal_codes: [],
    center_latitude: 27.9506,
    center_longitude: -82.4572,
    radius_miles: 25,
    travel_fee_cents: 0,
    per_mile_cents: 0,
    free_miles: 25,
    priority: 10,
    is_active: true,
    notes: "No travel fee inside the core market.",
  },
  {
    id: "5a000000-0000-4000-8000-000000000002",
    name: "Extended Tampa Bay",
    market: "Tampa Bay",
    kind: "travel_zone",
    state: "FL",
    cities: ["sarasota", "bradenton", "lakeland", "spring hill", "new port richey", "plant city", "zephyrhills", "tarpon springs", "land o lakes", "ruskin", "sun city center"],
    postal_codes: [],
    center_latitude: 27.9506,
    center_longitude: -82.4572,
    radius_miles: 65,
    travel_fee_cents: $(35),
    per_mile_cents: 150,
    free_miles: 25,
    priority: 20,
    is_active: true,
    notes: "$35 + $1.50/mile beyond 25 miles.",
  },
];

/* ----------------------------------------------------------------------------
 * Sample portfolio & testimonials — flagged is_sample, hidden in production
 * unless SHOW_SAMPLE_CONTENT=true. Replace with real work before launch.
 * -------------------------------------------------------------------------- */
const PID = (n: number) => `90000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
let mediaSeq = 0;
const photo = (url: string, alt: string, kind: "photo" | "drone" | "video" = "photo") => ({
  id: `91000000-0000-4000-8000-${String(++mediaSeq).padStart(12, "0")}`,
  kind,
  url,
  poster_url: null,
  alt,
  caption: null,
  width: null,
  height: null,
  sort_order: mediaSeq,
});

type ProjectSeed = Omit<PortfolioProject, "is_published" | "is_sample" | "video_url" | "tour_url" | "shot_on" | "state" | "city"> &
  Partial<Pick<PortfolioProject, "video_url" | "tour_url">>;
const project = (p: ProjectSeed): PortfolioProject => ({
  video_url: null,
  tour_url: null,
  shot_on: null,
  city: null,
  state: null,
  ...p,
  is_published: true,
  is_sample: true,
});

export const SAMPLE_PORTFOLIO: PortfolioProject[] = [
  project({
    id: PID(1), slug: "bayfront-modern", title: "Bayfront Modern", neighborhood: "Waterfront", property_type: "Luxury single-family",
    categories: ["photography", "twilight", "luxury", "residential"],
    description: "A glass-walled waterfront home captured at dusk to show off its pool terrace and open-plan interiors.",
    services_performed: ["Photography", "Twilight Photography", "Drone Photography"],
    cover_image_url: IMAGES.heroDusk, is_featured: true, sort_order: 10,
    media: [photo(IMAGES.heroDusk, "Waterfront modern home at dusk"), photo(IMAGES.livingBright, "Open-plan living room"), photo(IMAGES.kitchenModern, "Chef's kitchen"), photo(IMAGES.bedroomSuite, "Primary suite"), photo(IMAGES.bathMarble, "Spa bathroom")],
  }),
  project({
    id: PID(2), slug: "palm-ridge-estate", title: "Palm Ridge Estate", neighborhood: "Golf community", property_type: "Estate",
    categories: ["luxury", "drone", "video", "residential"],
    description: "Aerial reveals and a cinematic walkthrough for a resort-style estate with a pool pavilion.",
    services_performed: ["Cinematic Video", "Drone Video", "Photography"],
    cover_image_url: IMAGES.heroVilla, is_featured: true, sort_order: 20,
    media: [photo(IMAGES.heroVilla, "Estate pool pavilion"), photo(IMAGES.villaPool, "Pool terrace"), photo(IMAGES.villaCourtyard, "Courtyard"), photo(IMAGES.aerialSuburb, "Aerial context", "drone"), photo(IMAGES.livingModern, "Great room")],
  }),
  project({
    id: PID(3), slug: "island-twilight", title: "Island Twilight", neighborhood: "Island district", property_type: "Single-family",
    categories: ["twilight", "photography", "luxury"],
    description: "A golden-hour session timed to the minute for a glowing exterior and warm interiors.",
    services_performed: ["Twilight Photography", "Virtual Twilight"],
    cover_image_url: IMAGES.villaTwilight, is_featured: true, sort_order: 30,
    media: [photo(IMAGES.villaTwilight, "Home at twilight"), photo(IMAGES.houseNight, "Front elevation at night"), photo(IMAGES.poolNight, "Pool terrace")],
  }),
  project({
    id: PID(4), slug: "harbor-view-residence", title: "Harbor View Residence", neighborhood: "Downtown", property_type: "Condo",
    categories: ["photography", "residential"],
    description: "Bright, airy condo photography that makes a 1,400 sq ft floor plan feel expansive.",
    services_performed: ["Photography", "Floor Plan", "Matterport 3D Tour"],
    cover_image_url: IMAGES.livingApartment, is_featured: false, sort_order: 40,
    media: [photo(IMAGES.livingApartment, "Condo living room"), photo(IMAGES.kitchenOpen, "Open kitchen"), photo(IMAGES.bedroomCalm, "Bedroom")],
  }),
  project({
    id: PID(5), slug: "coastal-aerial-series", title: "Coastal Aerial Series", neighborhood: "Gulf coast", property_type: "Land & lots",
    categories: ["drone", "residential"],
    description: "High-altitude drone stills showing water access, lot lines and neighborhood amenities.",
    services_performed: ["Drone Photography", "Drone Video"],
    cover_image_url: IMAGES.aerialSuburb, is_featured: true, sort_order: 50,
    media: [photo(IMAGES.aerialSuburb, "Neighborhood from above", "drone"), photo(IMAGES.aerialCoast, "Skyline aerial", "drone")],
  }),
  project({
    id: PID(6), slug: "midtown-office-suites", title: "Midtown Office Suites", neighborhood: "Business district", property_type: "Commercial office",
    categories: ["commercial", "photography"],
    description: "Leasing photography for a boutique office building — lobby, suites and amenity spaces.",
    services_performed: ["Photography", "Matterport 3D Tour"],
    cover_image_url: IMAGES.officeInterior, is_featured: false, sort_order: 60,
    media: [photo(IMAGES.officeInterior, "Office interior"), photo(IMAGES.officeOpen, "Open workspace"), photo(IMAGES.officeTower, "Building exterior")],
  }),
  project({
    id: PID(7), slug: "lakeside-contemporary", title: "Lakeside Contemporary", neighborhood: "Lakefront", property_type: "Single-family",
    categories: ["video", "photography", "luxury", "residential"],
    description: "A cinematic listing film paired with a vertical reel built for social reach.",
    services_performed: ["Cinematic Video", "Social Media Reel", "Photography"],
    cover_image_url: IMAGES.exteriorModern, is_featured: true, sort_order: 70,
    media: [photo(IMAGES.exteriorModern, "Contemporary exterior"), photo(IMAGES.kitchenChef, "Kitchen island"), photo(IMAGES.bathSpa, "Spa bath")],
  }),
  project({
    id: PID(8), slug: "oak-street-bungalow", title: "Oak Street Bungalow", neighborhood: "Historic district", property_type: "Single-family",
    categories: ["photography", "residential"],
    description: "Warm, true-to-life photos for a restored craftsman bungalow.",
    services_performed: ["Photography", "Floor Plan"],
    cover_image_url: IMAGES.exteriorClassic, is_featured: false, sort_order: 80,
    media: [photo(IMAGES.exteriorClassic, "Craftsman exterior"), photo(IMAGES.livingCozy, "Living room"), photo(IMAGES.bedroomClassic, "Bedroom")],
  }),
  project({
    id: PID(9), slug: "garden-townhome", title: "Garden Townhome", neighborhood: "Midtown", property_type: "Townhome",
    categories: ["photography", "residential"],
    description: "A three-level townhome shot for flow — every room in the order a buyer walks it.",
    services_performed: ["Photography", "Property Website"],
    cover_image_url: IMAGES.exteriorSuburban, is_featured: false, sort_order: 90,
    media: [photo(IMAGES.exteriorSuburban, "Townhome exterior"), photo(IMAGES.kitchenWhite, "White kitchen"), photo(IMAGES.bathModern, "Modern bath")],
  }),
  project({
    id: PID(10), slug: "downtown-loft", title: "Downtown Loft", neighborhood: "Warehouse district", property_type: "Loft",
    categories: ["video", "residential"],
    description: "Moody, textured interiors and a 45-second reel for a converted warehouse loft.",
    services_performed: ["Social Media Reel", "Photography"],
    cover_image_url: IMAGES.livingLoft, is_featured: false, sort_order: 100,
    media: [photo(IMAGES.livingLoft, "Loft living space"), photo(IMAGES.livingDining, "Dining area"), photo(IMAGES.kitchenOpen, "Loft kitchen")],
  }),
  project({
    id: PID(11), slug: "retail-plaza", title: "Retail Plaza", neighborhood: "Commercial corridor", property_type: "Retail",
    categories: ["commercial", "drone"],
    description: "Aerial and ground photography for a neighborhood retail center's leasing brochure.",
    services_performed: ["Drone Photography", "Photography", "Marketing Kit"],
    cover_image_url: IMAGES.officeTower, is_featured: false, sort_order: 110,
    media: [photo(IMAGES.officeTower, "Retail building"), photo(IMAGES.aerialCoast, "Aerial of the district", "drone")],
  }),
  project({
    id: PID(12), slug: "palm-court-residence", title: "Palm Court Residence", neighborhood: "Coastal", property_type: "Single-family",
    categories: ["photography", "drone", "residential"],
    description: "A bright coastal home photographed from the ground and the air, with virtual twilight for the hero shot.",
    services_performed: ["Photography", "Drone Photography", "Virtual Twilight"],
    cover_image_url: IMAGES.exteriorPalms, is_featured: false, sort_order: 120,
    media: [photo(IMAGES.exteriorPalms, "Front elevation with palms"), photo(IMAGES.exteriorWhite, "Pool courtyard"), photo(IMAGES.livingArched, "Living room"), photo(IMAGES.aerialSuburb, "Aerial view", "drone")],
  }),
];

const TID = (n: number) => `7e000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  { id: TID(1), author_name: "Alexis M.", author_title: "Listing Agent", company: null, quote: "Booked at 10 PM, shot the next morning, photos in my inbox before my first coffee the day after. The listing had 14 showings the first weekend.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 10 },
  { id: TID(2), author_name: "Jordan T.", author_title: "Broker Associate", company: null, quote: "The twilight shots made our listing the first thing people saw on the portal. Clients ask who our photographer is every single time.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 20 },
  { id: TID(3), author_name: "Priya S.", author_title: "Property Manager", company: null, quote: "We run 40+ rentals. One dashboard for every property, invoices in one place, media I can download in one click. It just works.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 30 },
  { id: TID(4), author_name: "Marcus L.", author_title: "Real Estate Investor", company: null, quote: "The cinematic video and reel did more for our flip than any open house. Professional, on time, zero back-and-forth.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 40 },
  { id: TID(5), author_name: "Dana R.", author_title: "Short-term Rental Host", company: null, quote: "Our booking rate jumped after the new photos went live. The drone shots of the beach access sold the place for us.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 50 },
  { id: TID(6), author_name: "Chris W.", author_title: "Team Lead", company: null, quote: "Our whole team books through the site now. Consistent quality on every listing means our brand finally looks as good as our service.", rating: 5, avatar_url: null, is_featured: true, is_published: true, is_sample: true, sort_order: 60 },
];

export const DEFAULT_IDS = { services: SID };
