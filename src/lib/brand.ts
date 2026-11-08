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
    "Tampa Bay real estate photography, listing video and drone for agents, plus ads, social content and lead generation for local businesses. Also serving Washington, DC.",
  location: "Tampa, FL & Washington, DC",
  locationNote: "Serving Tampa Bay, the DMV and brands everywhere",
  /** Same number and hours as the Google Business Profile and Yelp page. */
  phone: "(571) 317-3211",
  phoneHref: "tel:+15713173211",
  hours: "Mon–Fri, 9am–6pm",
  /**
   * Where "Book a free 15-min call" goes. Points at the call section on
   * /contact until a Calendly (or similar) link exists; paste that URL here
   * and every call button follows.
   */
  callHref: "/contact#call",
  /** Shown only when set (Admin → Settings → Business overrides this). */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "natejennings99@gmail.com",
  foundedYear: 2024,
  emblem: "/media/brand/emblem.jpg",
  instagram: "https://www.instagram.com/jennings_media/",
  instagramHandle: "@jennings_media",
  /** Nathaniel's vertical, cinematic work (rooftops, boats, drone, nights out). */
  tiktok: "https://www.tiktok.com/@nathanielproductions",
  tiktokHandle: "@nathanielproductions",
} as const;

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/real-estate", label: "Real Estate" },
  { href: "/events", label: "Events" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
