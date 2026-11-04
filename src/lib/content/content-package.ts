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
