/**
 * Photo, video and social content: what we do and the three content packages, shown on
 * /services#packages and the industry pages.
 *
 * Prices are never typed here. A tier either points at a price that already exists in
 * plans.ts, or has `price: null`, which means "[PRICE]" — not decided yet. To set one,
 * add the number to plans.ts and reference it here.
 */
import { CONTENT_PACKAGE } from "./content-package";
import { RETAINERS } from "./plans";

/**
 * Unfinished spots ("[PRICE]", "[ADD REAL PROJECT]") are shown while you work on the site
 * (npm run dev) so they are easy to find. The live site hides them: a missing price reads
 * "Quoted on your call" and an empty project slot is left out. Set SHOW_PLACEHOLDERS=true
 * to see them in a production build too.
 */
export const showPlaceholders = () => process.env.NODE_ENV !== "production" || process.env.SHOW_PLACEHOLDERS === "true";

export const PRICE_PLACEHOLDER = "[PRICE]";
export const PROJECT_PLACEHOLDER = "[ADD REAL PROJECT]";

export const CORE_SERVICES = [
  {
    slug: "photo",
    title: "Photo",
    body: "We come to you and photograph your space, your people and what you sell. You get edited photos for your website, your Google listing and your social pages.",
    points: ["On-site shoot", "Edited photos, ready to use", "Sized for web and social"],
  },
  {
    slug: "video",
    title: "Video",
    body: "Short videos made for phones. We film and edit them so they are ready for Instagram, TikTok and Facebook.",
    points: ["Filmed on site", "Short vertical videos", "Edited and ready to post"],
  },
  {
    slug: "social",
    title: "Social content",
    body: "A steady supply of posts. One shoot a month gives you a month of photos and videos. If you want, we post them for you too.",
    points: ["One shoot a month", "Photos and videos each month", "We can post for you"],
  },
] as const;

export type ContentTier = {
  slug: string;
  name: string;
  /** Whole US dollars, taken from plans.ts. null = not set yet ([PRICE]). */
  price: number | null;
  per: "month" | "shoot";
  tagline: string;
  features: readonly string[];
  href: string;
  cta: string;
  recommended?: boolean;
};

const starter = RETAINERS.find((p) => p.slug === "starter");

export const CONTENT_TIERS: ContentTier[] = [
  {
    slug: "single-shoot",
    name: "Single Shoot",
    price: null, // [PRICE] — no one-off shoot price for local businesses exists yet.
    per: "shoot",
    tagline: "One visit. Photos and short videos you keep.",
    features: ["One on-site shoot", "A set of edited photos", "Short vertical videos from the same visit", "No monthly commitment"],
    href: "/book-a-call",
    cta: "Book a call",
  },
  {
    slug: CONTENT_PACKAGE.slug,
    name: CONTENT_PACKAGE.name,
    price: CONTENT_PACKAGE.price,
    per: "month",
    tagline: "One shoot a month. A month of content.",
    features: CONTENT_PACKAGE.includes,
    href: "/content-package",
    cta: "See the package",
    recommended: true,
  },
  {
    slug: "content-and-posting",
    name: "Content + Posting",
    // The Starter retainer on /plans: same offer, same price, one source.
    price: starter?.price ?? null,
    per: "month",
    tagline: "We make the content and post it for you.",
    features: starter?.features ?? [],
    href: "/plans",
    cta: "See all plans",
  },
];

/** "$1,500" for a set price; "[PRICE]" while working on the site; a plain line on the live site. */
export function tierPriceLabel(tier: Pick<ContentTier, "price">, placeholders = showPlaceholders()) {
  if (tier.price != null) return `$${tier.price.toLocaleString("en-US")}`;
  return placeholders ? PRICE_PLACEHOLDER : "Quoted on your call";
}
