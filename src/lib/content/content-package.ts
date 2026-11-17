/**
 * /content-package — one monthly content package for local businesses (restaurants, gyms,
 * salons, shops). The price lives in plans.ts (CONTENT_PACKAGE_PRICE) so it's one edit.
 */
import { CONTENT_PACKAGE_PRICE } from "./plans";

export const CONTENT_PACKAGE = {
  slug: "content-package",
  name: "Monthly Content Package",
  price: CONTENT_PACKAGE_PRICE,
  priceLabel: `$${CONTENT_PACKAGE_PRICE.toLocaleString("en-US")}/month`,
  headline: "One shoot a month. A month of content.",
  sub: "For restaurants, gyms, salons and local shops that want to look great online without thinking about it.",
  includes: [
    "One on-site shoot a month, around your opening hours",
    "A set of edited photos: your space, your people, your product",
    "Four short vertical videos cut for Instagram, TikTok and Facebook",
    "Everything delivered ready to post, sized for every platform",
    "One flat monthly price, no ad spend required",
  ],
  steps: [
    { title: "We call you", body: "A short call to learn what you sell and what a good month looks like." },
    { title: "We shoot", body: "One visit a month. You keep running the business." },
    { title: "You post", body: "Photos and four videos land in a shared folder, ready for every platform." },
  ],
} as const;

/** Our own work, shown as examples of what the package delivers. Everything here is real client work from /public/media. */
export const CONTENT_PACKAGE_EXAMPLES = [
  { kind: "video", title: "Vertical video", caption: "Isaia, menswear store in Georgetown — 9:16 reel", src: "/media/video/isaia.mp4", poster: "/media/video/isaia.jpg" },
  { kind: "photo", title: "Edited photos", caption: "Groom Guy, men's grooming — the chair, the team, the details", src: "/media/photos/groom-chair.jpg" },
  { kind: "photo", title: "Your space", caption: "Taproom at 2 Silos Brewery, shot during a client event", src: "/media/photos/2-silos-taproom.jpg" },
] as const;

export const BEST_TIMES = ["Morning", "Midday", "Afternoon", "Evening"] as const;

/**
 * Questions a Tampa restaurant or shop owner asks before hiring a content creator.
 * Shown on /content-package with FAQPage schema. Answers state only what the package
 * includes; no contract terms, results or market-rate claims we can't back up.
 */
export const CONTENT_PACKAGE_FAQS = [
  {
    q: "How much does a content creator cost for a Tampa restaurant?",
    a: `Our package is ${CONTENT_PACKAGE.priceLabel}, flat: one on-site shoot a month, a set of edited photos of your space, your people and your food, and four short vertical videos for Instagram, TikTok and Facebook. No ad spend is required.`,
  },
  {
    q: "When do you shoot at a restaurant?",
    a: "Around your opening hours. Before service suits plated dishes and the empty room; a busy service suits the energy and the people. We agree the time on the first call so the shoot never gets in the way of the kitchen.",
  },
  {
    q: "Do you post the content for us?",
    a: "The package delivers everything ready to post and sized for every platform, and you post it. If you want someone to run the accounts as well, that's our social media management service, quoted separately.",
  },
  {
    q: "Is it only for restaurants?",
    a: "No. The same package works for gyms, salons, cafés, breweries and local shops: anywhere the space, the people and the product are worth showing.",
  },
  {
    q: "Where do you shoot?",
    a: "Across Tampa Bay, including Tampa, St. Petersburg and Clearwater, and in the Washington, DC area.",
  },
] as const;
