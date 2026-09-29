/**
 * Agency site copy & structure. Case studies, testimonials, client logos and
 * stats live in the database (Admin → Work / Testimonials / Clients / Settings).
 */
import { AGENCY_IMAGES as A } from "./agency-images";

export const HERO_KEYWORDS = ["IGNORE.", "FORGET.", "SKIP.", "SCROLL PAST."] as const;

export interface AgencyService {
  slug: string;
  number: string;
  title: string;
  short: string;
  body: string;
  deliverables: string[];
  outcome: string;
  image: string;
}

export const AGENCY_SERVICES: AgencyService[] = [
  {
    slug: "lead-generation",
    number: "01",
    title: "Lead Generation",
    short: "Funnels, offers and follow-up that turn strangers into booked calls.",
    body: "We build the whole path from first click to signed client: a sharp offer, a landing page that converts, instant lead alerts and follow-up that never lets a lead go cold.",
    deliverables: ["Offer & funnel strategy", "Landing pages & lead forms", "CRM + automated follow-up", "Lead tracking & reporting"],
    outcome: "More booked calls \u2014 not just more clicks.",
    image: A.deskTop,
  },
  {
    slug: "paid-media",
    number: "02",
    title: "Meta & Google Ads",
    short: "Facebook, Instagram, Google and YouTube campaigns built to pay for themselves.",
    body: "Full-funnel campaigns across Meta and Google \u2014 creative, targeting, retargeting and tracking \u2014 managed weekly against cost per lead, not vanity metrics.",
    deliverables: ["Meta (Facebook & Instagram) ads", "Google Search, Maps & YouTube ads", "Retargeting & lookalike audiences", "Pixel, conversions & reporting"],
    outcome: "A predictable cost per lead you can scale.",
    image: A.earthNight,
  },
  {
    slug: "ai-automation",
    number: "03",
    title: "AI Agents",
    short: "Custom AI assistants that answer, qualify and book your leads 24/7.",
    body: "We design, train and deploy AI agents on your website, inbox and DMs \u2014 trained on your services and your tone \u2014 so every lead gets an instant, on-brand reply and a clear next step.",
    deliverables: ["Website & DM chat agents", "Lead qualification & booking", "CRM & calendar integrations", "Workflow automations"],
    outcome: "Every lead answered in seconds, day or night.",
    image: A.circuit,
  },
  {
    slug: "social-media",
    number: "04",
    title: "Social Media",
    short: "A daily presence that builds trust before the first call.",
    body: "Strategy, content calendars, posting and community management across Instagram, TikTok, Facebook, LinkedIn and YouTube \u2014 with reels shot and edited in-house.",
    deliverables: ["Content calendar & posting", "Short-form reels", "Community management", "Monthly analytics"],
    outcome: "A feed that makes you the obvious choice.",
    image: A.confetti,
  },
  {
    slug: "content-production",
    number: "05",
    title: "Content Production",
    short: "4K films, photography and drone \u2014 shot and cut in-house.",
    body: "Brand films, listing tours, event recaps, product and team photography, produced by the same crew that runs your campaigns, so every asset is made to perform.",
    deliverables: ["Brand & promo films", "Photography", "Drone & aerial", "Vertical edits for social"],
    outcome: "Creative that stops the scroll.",
    image: "/media/video/reel-2.jpg",
  },
  {
    slug: "web-design",
    number: "06",
    title: "Websites & Funnels",
    short: "Fast, conversion-first sites that turn visits into inquiries.",
    body: "Websites and landing pages with clear offers, tracking and speed built in \u2014 designed to capture the leads your ads and content create.",
    deliverables: ["Website design & build", "Landing pages", "Analytics & tracking", "Speed & SEO foundations"],
    outcome: "A site that turns traffic into inquiries.",
    image: A.retroTech,
  },
  {
    slug: "brand-strategy",
    number: "07",
    title: "Brand Strategy",
    short: "Positioning, messaging and identity that make you the obvious pick.",
    body: "We sharpen who you serve, what you promise and how you look, so every ad, post and page says the same compelling thing.",
    deliverables: ["Positioning & messaging", "Visual identity", "Brand guidelines", "Launch plan"],
    outcome: "A brand people remember \u2014 and refer.",
    image: A.architectureWhite,
  },
  {
    slug: "seo-content",
    number: "08",
    title: "SEO + Content",
    short: "Search visibility that compounds month after month.",
    body: "Technical SEO, Google Business Profile, local pages and content that ranks \u2014 so clients find you when they're ready to buy.",
    deliverables: ["Technical & local SEO", "Google Business Profile", "Content that ranks", "Reviews strategy"],
    outcome: "Inbound leads that don't depend on ad spend.",
    image: A.towersUp,
  },
];

export const DIFFERENTIATORS = [
  { title: "Strategy first", body: "Everything starts with understanding the business." },
  { title: "Creative that converts", body: "Beautiful work without performance is decoration." },
  { title: "Move fast", body: "Launch, learn, optimize, scale." },
  { title: "One team", body: "Creative, media, content and technology under one roof." },
] as const;

export const PROCESS = [
  { number: "01", title: "Discover", body: "Customers, margins, competitors and data — we learn the business before we touch the brand." },
  { number: "02", title: "Strategize", body: "One plan that connects positioning, channels, creative and the numbers that matter." },
  { number: "03", title: "Create", body: "Concepts, shoots, edits and builds, produced in-house and fast." },
  { number: "04", title: "Launch", body: "Campaigns go live with tracking, testing and guardrails from day one." },
  { number: "05", title: "Optimize", body: "Weekly creative and media iterations driven by what the data says — not what we hoped." },
  { number: "06", title: "Scale", body: "Double down on what works. New channels, new audiences, new markets." },
] as const;

export const INDUSTRIES = [
  { name: "Hospitality", image: "/media/video/pet-grand-hotel.jpg", video: "/media/video/pet-grand-hotel.mp4" },
  { name: "Real Estate", image: "/media/video/great-falls.jpg", video: "/media/video/great-falls.mp4" },
  { name: "Events & Sports", image: "/media/video/polo.jpg", video: "/media/video/polo.mp4" },
  { name: "Consumer Brands", image: "/media/stock/consumer-brands.jpg", video: "/media/stock/consumer-brands.mp4" },
  { name: "Fashion & Retail", image: "/media/video/isaia.jpg", video: "/media/video/isaia.mp4" },
  { name: "Restaurants", image: "/media/stock/restaurants.jpg", video: "/media/stock/restaurants.mp4" },
  { name: "Professional Services", image: "/media/video/smart-settlements.jpg", video: "/media/video/smart-settlements.mp4" },
  { name: "E-Commerce", image: "/media/stock/e-commerce.jpg", video: "/media/stock/e-commerce.mp4" },
] as const;

export const BUDGETS = ["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000+"] as const;

export const INQUIRY_SERVICES = AGENCY_SERVICES.map((s) => s.title);

export const NEEDS = ["More leads & clients", "Meta & Google Ads", "An AI agent or automation", "Content & social media", "A new website or brand", "Something else"] as const;

/* ------------------------------------------------------------------ insights */

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  minutes: number;
  image: string;
  body: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    slug: "the-first-three-seconds",
    title: "The first three seconds",
    excerpt: "Most short-form creative dies before the viewer knows who it's from. A field guide to openings that stop the thumb.",
    category: "Creative",
    date: "2026-09-22",
    minutes: 4,
    image: A.filmSet,
    body: [
      { type: "p", text: "Feeds don't reward patience. On every major platform the decision to keep watching happens in the first second or two, long before your logo, your offer or your carefully written line three. If the opening doesn't earn attention, nothing after it exists." },
      { type: "h2", text: "Open on motion, not setup" },
      { type: "p", text: "The frame should already be moving when the video starts: a pour, a door swinging open, a hand reaching into shot. Static openers read as ads, and ads get skipped. Cut the establishing shot — the viewer will establish it for you." },
      { type: "h2", text: "Lead with the promise" },
      { type: "p", text: "Say the most valuable thing first. \"The pool looks like this at 6 a.m.\" beats \"Welcome to our resort.\" Your hook is a promise the rest of the video keeps." },
      { type: "h2", text: "Design for sound off" },
      { type: "p", text: "A large share of viewers never turn the sound on. On-screen text should carry the idea on its own, set big enough to read on a phone at arm's length, and timed to land before the first cut." },
      { type: "quote", text: "Test hooks, not ads. Keep the body of the video identical and swap only the first three seconds — that's where the variance lives." },
      { type: "h2", text: "A quick opening checklist" },
      { type: "list", items: ["Movement in the very first frame", "The payoff stated, not teased", "Readable text without sound", "A face, a product or a result on screen by 1.5 seconds", "At least three hook variations per concept"] },
    ],
  },
  {
    slug: "roas-is-a-lagging-indicator",
    title: "ROAS is a lagging indicator",
    excerpt: "By the time return on ad spend drops, the problem started weeks ago. The leading signals we watch instead.",
    category: "Performance",
    date: "2026-09-03",
    minutes: 5,
    image: A.earthNight,
    body: [
      { type: "p", text: "ROAS is a scoreboard, not a steering wheel. It tells you how the last few weeks went, blends new and returning customers, and hides fatigue until it's expensive. Teams that manage to ROAS alone are always reacting." },
      { type: "h2", text: "Watch attention first" },
      { type: "p", text: "Hook rate (3-second views over impressions) and hold rate (completions over 3-second views) tell you whether creative is working before a single purchase happens. When hook rate slides, fatigue is coming — refresh before cost per acquisition moves." },
      { type: "h2", text: "Then watch intent" },
      { type: "p", text: "Outbound click-through rate and landing-page conversion rate separate a creative problem from an offer or page problem. If people click and don't convert, more media won't fix it." },
      { type: "h2", text: "Judge the business on margin" },
      { type: "p", text: "Blended marketing efficiency ratio and contribution margin per order connect media to the P&L. A campaign with lower ROAS can be the better investment if it brings in customers who come back." },
      { type: "list", items: ["Daily: hook rate, hold rate, CPM", "Weekly: outbound CTR, landing-page conversion, CPA by audience", "Monthly: blended MER, contribution margin, new-customer share", "Quarterly: 90-day customer value by acquisition channel"] },
      { type: "quote", text: "Manage the leading indicators and ROAS takes care of itself." },
    ],
  },
  {
    slug: "fewer-campaigns-more-systems",
    title: "Fewer campaigns, more systems",
    excerpt: "Big launches get applause. Creative systems get results. How to build one your team can run every week.",
    category: "Strategy",
    date: "2026-08-12",
    minutes: 4,
    image: A.teamWhiteboard,
    body: [
      { type: "p", text: "The launch campaign is where most marketing budgets peak and most learning stops. A creative system flips that: smaller bets, shipped constantly, with every result feeding the next brief." },
      { type: "h2", text: "Build in modules" },
      { type: "p", text: "Break creative into swappable parts — hooks, proof points, offers and calls to action. One shoot should produce dozens of combinations, so testing is a matter of assembly rather than production." },
      { type: "h2", text: "Name everything" },
      { type: "p", text: "A naming convention that encodes concept, hook, format and audience turns your ad account into a searchable library. Without it, you can't tell which idea won — only which ad did." },
      { type: "h2", text: "Close the loop weekly" },
      { type: "p", text: "Thirty minutes every week: what won, why we think it won, what we'll try next. Write it down. After a quarter you'll have a playbook no competitor can copy because it's built on your customers." },
      { type: "list", items: ["A modular asset library", "A testing calendar with a fixed weekly cadence", "A naming convention everyone follows", "A single dashboard for creative performance", "A standing weekly learning review"] },
    ],
  },
];
