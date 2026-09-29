/**
 * Monthly retainers + fixed-price packages, sold through Stripe Checkout on /plans.
 * Prices are in whole US dollars — edit freely; Stripe picks up changes on the next checkout.
 */
export type Plan = {
  slug: string;
  name: string;
  price: number;
  interval: "month" | null;
  tagline: string;
  features: string[];
  recommended?: boolean;
};

export const RETAINERS: Plan[] = [
  {
    slug: "starter",
    name: "Starter",
    price: 1500,
    interval: "month",
    tagline: "Show up every week, look the part.",
    features: ["Social media management on 2 platforms", "12 posts + 4 short-form reels a month", "One content shoot a month", "Monthly performance report"],
  },
  {
    slug: "growth",
    name: "Growth",
    price: 3500,
    interval: "month",
    recommended: true,
    tagline: "Turn attention into booked clients.",
    features: ["Everything in Starter", "Meta & Google Ads management (ad spend paid to the platforms)", "Lead-generation funnel + landing page", "Instant lead alerts + CRM follow-up automations", "Bi-weekly strategy call"],
  },
  {
    slug: "scale",
    name: "Scale",
    price: 6500,
    interval: "month",
    tagline: "A full growth team — plus an AI agent that never sleeps.",
    features: ["Everything in Growth", "Custom AI agent that answers, qualifies and books leads 24/7", "Ads across Meta, Google, YouTube & TikTok", "Monthly brand film or campaign shoot", "Weekly reporting + priority support"],
  },
];

export const PACKAGES: Plan[] = [
  {
    slug: "ad-launch-sprint",
    name: "Ad Launch Sprint",
    price: 1500,
    interval: null,
    tagline: "Meta + Google campaigns, built and live.",
    features: ["Offer, audience & funnel plan", "Campaign build on Meta and Google", "5 ad creatives", "Pixel + conversion tracking"],
  },
  {
    slug: "lead-gen-funnel",
    name: "Lead-Gen Funnel",
    price: 2000,
    interval: null,
    tagline: "A landing page engineered to capture clients.",
    features: ["Conversion-focused landing page", "Lead form with instant email/SMS alerts", "CRM hookup", "Copy written to convert"],
  },
  {
    slug: "ai-agent-setup",
    name: "AI Agent Setup",
    price: 2500,
    interval: null,
    tagline: "An assistant that answers, qualifies and books — around the clock.",
    features: ["Trained on your business, services and FAQs", "Website chat + lead qualification", "Calendar booking + CRM handoff", "30 days of tuning"],
  },
  {
    slug: "brand-film",
    name: "Brand Film",
    price: 2000,
    interval: null,
    tagline: "Your story, shot and cut in 4K.",
    features: ["Half-day shoot", "60–90s hero film + 3 vertical cuts", "Licensed music + colour grade", "Captions for sound-off viewing"],
  },
];

export const findPlan = (slug: string | undefined) => [...RETAINERS, ...PACKAGES].find((p) => p.slug === slug) ?? null;

export const formatPlanPrice = (p: Plan) => `$${p.price.toLocaleString("en-US")}`;
