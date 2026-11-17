/**
 * /industries/[slug] — six short pages, one per kind of client: restaurants, gyms,
 * realtors, salons, Airbnb hosts and e-commerce brands.
 *
 * Rules for this file:
 *  - Plain words. Say what they get and how to book a call.
 *  - Examples are our own real shoots from /public/media only. No stock, no made-up clients.
 *    An industry we have not shot yet has an empty `examples` list; the page then shows an
 *    "[ADD REAL PROJECT]" slot while you work on the site and nothing on the live site.
 *  - No prices typed here. `price` points at a number that already exists, or at a page
 *    that has the prices, or is "ask" (shown as [PRICE] until one is set).
 */
import { CONTENT_PACKAGE } from "./content-package";

export type IndustryExample = { src: string; alt: string; caption: string; w: number; h: number };

export type IndustryPage = {
  slug: string;
  /** Short name for links and lists. */
  name: string;
  /** <title> — unique per page. The layout adds "| Jennings Media". */
  seoTitle: string;
  /** Meta description — unique per page. */
  description: string;
  label: string;
  h1: [string, string];
  intro: string;
  gets: string[];
  /** Where the price comes from. Never a number typed here. */
  price: { kind: "content-package" } | { kind: "link"; href: string; text: string; cta: string } | { kind: "ask" };
  examples: IndustryExample[];
  /** One more useful page for this visitor. */
  related: { href: string; label: string };
};

const AREA = "Tampa, St. Pete and Clearwater";

export const INDUSTRY_PAGES: IndustryPage[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    seoTitle: "Restaurant Photo & Video in Tampa Bay",
    description: `Photos and short videos for restaurants, bars and cafes in ${AREA}. One shoot a month, ready to post. Book a free 15-minute call.`,
    label: "For restaurants, bars and cafes",
    h1: ["Photos and video", "for restaurants."],
    intro: "People choose where to eat with their phone. We come in once a month, photograph the food, the room and your team, and hand you photos and short videos that are ready to post.",
    gets: [
      "Photos of your dishes, your drinks, your room and your team",
      "Four short vertical videos a month for Instagram, TikTok and Facebook",
      "One shoot a month, planned around your opening hours",
      "Everything edited and sized, ready to post",
    ],
    price: { kind: "content-package" },
    examples: [{ src: "/media/photos/2-silos-taproom.jpg", alt: "Taproom at 2 Silos Brewery", caption: "Taproom at 2 Silos Brewery, shot during a client event", w: 1600, h: 1067 }],
    related: { href: "/content-package", label: "See the monthly content package" },
  },
  {
    slug: "gyms",
    name: "Gyms",
    seoTitle: "Gym Photo & Video in Tampa Bay",
    description: `Photos and short videos for gyms and fitness studios in ${AREA}: your space, your classes and your coaches. Book a free 15-minute call.`,
    label: "For gyms and fitness studios",
    h1: ["Photos and video", "for gyms."],
    intro: "New members want to see the place before they walk in. We photograph your space, your classes and your coaches, and cut short videos you can post all month.",
    gets: [
      "Photos of the gym floor, your classes and your coaches",
      "Four short vertical videos a month for Instagram, TikTok and Facebook",
      "One shoot a month, at a time that suits your class schedule",
      "Everything edited and sized, ready to post",
    ],
    price: { kind: "content-package" },
    examples: [],
    related: { href: "/content-package", label: "See the monthly content package" },
  },
  {
    slug: "realtors",
    name: "Realtors",
    seoTitle: "Photo & Video for Realtors in Tampa Bay",
    description: `Listing photos, video, drone and floor plans for real estate agents in ${AREA}. See prices online, or book a free 15-minute call.`,
    label: "For real estate agents and brokerages",
    h1: ["Photos and video", "for realtors."],
    intro: "A listing gets one first look. We shoot the photos, the video and the drone footage for it. Prices are listed online.",
    gets: [
      "Edited listing photos, inside and out",
      "A listing video, and a vertical reel for social",
      "Drone photos and video",
      "Floor plans",
      "Clear prices, listed online",
    ],
    price: { kind: "link", href: "/pricing", text: "Real estate prices are listed online.", cta: "See real estate prices" },
    examples: [
      { src: "/media/photos/twilight-deck.jpg", alt: "Twilight exterior with deck, 13521 Granite Rock Dr", caption: "Twilight exterior from one of our listing shoots", w: 1600, h: 1067 },
      { src: "/media/photos/great-room.jpg", alt: "Vaulted great room", caption: "Great room from one of our listing shoots", w: 1600, h: 1067 },
    ],
    related: { href: "/real-estate", label: "See all real estate media" },
  },
  {
    slug: "salons",
    name: "Salons",
    seoTitle: "Salon Photo & Video in Tampa Bay",
    description: `Photos and short videos for salons, barbershops and spas in ${AREA}: your chairs, your team and your work. Book a free 15-minute call.`,
    label: "For salons, barbershops and spas",
    h1: ["Photos and video", "for salons."],
    intro: "Your work is visual, so your pages should be too. We photograph your space, your team and finished looks, and cut short videos you can post all month.",
    gets: [
      "Photos of your space, your team and finished looks",
      "Four short vertical videos a month for Instagram, TikTok and Facebook",
      "One shoot a month, booked around your appointments",
      "Everything edited and sized, ready to post",
    ],
    price: { kind: "content-package" },
    examples: [
      { src: "/media/photos/groom-chair.jpg", alt: "Groom Guy grooming chair and display", caption: "Groom Guy, men's grooming: the chair and the details", w: 1600, h: 1068 },
      { src: "/media/photos/groom-team-2.jpg", alt: "Groom Guy team", caption: "Groom Guy: the team", w: 1600, h: 1067 },
    ],
    related: { href: "/content-package", label: "See the monthly content package" },
  },
  {
    slug: "airbnb-hosts",
    name: "Airbnb hosts",
    seoTitle: "Airbnb Photos & Video in Tampa Bay",
    description: `Photos, video and drone for Airbnb and vacation rental hosts in ${AREA}. Show every room at its best. Book a free 15-minute call.`,
    label: "For Airbnb and vacation rental hosts",
    h1: ["Photos and video", "for Airbnb hosts."],
    intro: "Guests book the place that looks best in the search results. We photograph every room and the outside, the same way we shoot homes for sale.",
    gets: [
      "Edited photos of every room and the outside",
      "A short video walk-through you can share",
      "Drone photos of the property and what is nearby",
      "Photos sized for Airbnb, Vrbo and your own site",
    ],
    price: { kind: "ask" },
    examples: [
      { src: "/media/photos/primary-suite.jpg", alt: "Primary suite, 3706 Edward Bluff", caption: "Bedroom from a home we shot for a sale listing", w: 1600, h: 1067 },
      { src: "/media/photos/spa-bath.jpg", alt: "Spa bath with freestanding tub, 3605 17th Street N", caption: "Bathroom from a home we shot for a sale listing", w: 1600, h: 1067 },
    ],
    related: { href: "/real-estate", label: "See our home photography" },
  },
  {
    slug: "e-commerce",
    name: "E-Commerce",
    seoTitle: "Product Photo & Video for Online Stores in Tampa Bay",
    description: `Product photos and short videos for online stores and e-commerce brands in ${AREA}. Ready for your store, ads and social. Book a free 15-minute call.`,
    label: "For online stores and e-commerce brands",
    h1: ["Photos and video", "for online stores."],
    intro: "Shoppers can't pick up your product, so the photos and video have to do the selling. We shoot your products and short videos you can use on your store, in ads and on social.",
    gets: [
      "Photos of your products, sized for your store and marketplaces",
      "Short vertical videos for Instagram, TikTok and ads",
      "Lifestyle shots of your product in use",
      "Everything edited and ready to upload",
    ],
    price: { kind: "ask" },
    // [ADD REAL PROJECT] — no e-commerce shoot in /public/media yet.
    examples: [],
    related: { href: "/services", label: "See all our services" },
  },
];

export const findIndustryPage = (slug: string) => INDUSTRY_PAGES.find((i) => i.slug === slug) ?? null;

/** The three steps every industry page shows. */
export const INDUSTRY_STEPS = [
  { title: "Book a call", body: "A free 15-minute call. Tell us about your business and what you want to show." },
  { title: "We shoot", body: "We come to you, at a time that suits you. You keep working." },
  { title: "You get your content", body: "Edited photos and videos in a shared folder, ready to use." },
] as const;

export const contentPackageLine = `${CONTENT_PACKAGE.name}: ${CONTENT_PACKAGE.priceLabel}`;
