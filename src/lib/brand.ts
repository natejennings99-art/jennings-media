/**
 * Brand identity — the single place to rename the agency.
 * Change `name` (and `shortName`) and the whole site, emails, schema, OG image
 * and dashboards follow. The emblem lives in /public/media/brand.
 */
export const BRAND = {
  name: "Jennings Media",
  shortName: "Jennings",
  descriptor: "Media & Marketing Agency",
  tagline: "Creative. Media. Growth.",
  description:
    "Marketing agency in Washington, DC & Tampa for brokerages, realtors and entrepreneurs: lead generation, Meta & Google Ads, AI agents and 4K content.",
  location: "Washington, DC & Tampa, FL",
  locationNote: "Serving the DMV, Tampa Bay and brands everywhere",
  /** Shown only when set (Admin → Settings → Business overrides this). */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "natejennings99@gmail.com",
  foundedYear: 2024,
  emblem: "/media/brand/emblem.jpg",
  instagram: "https://www.instagram.com/jennings_media/",
  instagramHandle: "@jennings_media",
} as const;

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/plans", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
] as const;
