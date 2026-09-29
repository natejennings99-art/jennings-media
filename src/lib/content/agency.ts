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
    slug: "brand-strategy",
    number: "01",
    title: "Brand Strategy",
    short: "Positioning, identity and voice that make you the obvious choice.",
    body: "We find the one thing your market should remember about you, then build the identity, language and guidelines that make it impossible to miss.",
    deliverables: ["Positioning & messaging", "Visual identity systems", "Naming & verbal identity", "Brand guidelines"],
    outcome: "A brand people can describe in one sentence.",
    image: A.architectureWhite,
  },
  {
    slug: "paid-media",
    number: "02",
    title: "Paid Media",
    short: "Meta, Google, TikTok and YouTube — engineered around profit, not vanity metrics.",
    body: "Full-funnel campaigns with creative testing built in. We plan to your margins, report on contribution, and move budget weekly toward what compounds.",
    deliverables: ["Media strategy & planning", "Creative testing frameworks", "Full-funnel campaigns", "Attribution & reporting"],
    outcome: "Spend that earns its keep.",
    image: A.earthNight,
  },
  {
    slug: "social-media",
    number: "03",
    title: "Social Media",
    short: "Always-on content and community that earns the follow — and the sale.",
    body: "Platform-native content, a publishing rhythm you can sustain, and community management that turns comments into customers.",
    deliverables: ["Channel strategy", "Content calendars", "Community management", "Creator & influencer programs"],
    outcome: "An audience that shows up.",
    image: A.confetti,
  },
  {
    slug: "content-production",
    number: "04",
    title: "Content Production",
    short: "Photo, film, motion and UGC — produced in-house, built for every placement.",
    body: "One shoot, dozens of assets. Our production crew captures campaign photography, short-form video and motion cut for every channel — including our real estate media studio.",
    deliverables: ["Campaign shoots", "Short-form & long-form video", "Motion & animation", "Real estate photo, drone & 3D"],
    outcome: "A content engine, not a one-off shoot.",
    image: A.filmSet,
  },
  {
    slug: "web-design",
    number: "05",
    title: "Web Design",
    short: "Fast, conversion-obsessed websites that feel as good as they look.",
    body: "Strategy-led UX, editorial design and engineering on modern frameworks. Every page earns its place with a clear job and a measurable goal.",
    deliverables: ["UX & conversion design", "Next.js development", "Landing page systems", "CRO testing"],
    outcome: "A site that sells while you sleep.",
    image: A.retroTech,
  },
  {
    slug: "seo-content",
    number: "06",
    title: "SEO + Content",
    short: "Search visibility built on content people actually want to read.",
    body: "Technical foundations, topical authority and an editorial engine that compounds — so you're found the moment someone starts looking.",
    deliverables: ["Technical SEO", "Content strategy", "Editorial production", "Local SEO"],
    outcome: "Demand you don't pay for twice.",
    image: A.deskTop,
  },
  {
    slug: "ai-automation",
    number: "07",
    title: "AI Automation",
    short: "Workflows that answer leads in seconds and give your team hours back.",
    body: "We connect your forms, CRM, calendars and inbox with practical AI — instant lead response, smart routing and reporting that writes itself.",
    deliverables: ["Lead response automation", "CRM & pipeline automation", "AI content workflows", "Reporting dashboards"],
    outcome: "Speed-to-lead measured in seconds.",
    image: A.circuit,
  },
  {
    slug: "growth-strategy",
    number: "08",
    title: "Growth Strategy",
    short: "The roadmap that ties brand, media and data to revenue targets.",
    body: "Audits, offer strategy, forecasting and an experiment roadmap — the operating plan behind every campaign we run.",
    deliverables: ["Growth audits", "Funnel & offer strategy", "Forecasting & budgeting", "Experiment roadmaps"],
    outcome: "A plan finance actually signs off on.",
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
  { name: "Hospitality", image: "/media/stock/hospitality.jpg", video: "/media/stock/hospitality.mp4" },
  { name: "Real Estate", image: "/media/video/great-falls.jpg", video: "/media/video/great-falls.mp4" },
  { name: "Technology", image: "/media/stock/technology.jpg", video: "/media/stock/technology.mp4" },
  { name: "Consumer Brands", image: "/media/stock/consumer-brands.jpg", video: "/media/stock/consumer-brands.mp4" },
  { name: "Lifestyle", image: "/media/stock/lifestyle.jpg", video: "/media/stock/lifestyle.mp4" },
  { name: "Restaurants", image: "/media/stock/restaurants.jpg", video: "/media/stock/restaurants.mp4" },
  { name: "Professional Services", image: "/media/stock/professional-services.jpg", video: "/media/stock/professional-services.mp4" },
  { name: "E-Commerce", image: "/media/stock/e-commerce.jpg", video: "/media/stock/e-commerce.mp4" },
] as const;

export const BUDGETS = ["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000+"] as const;

export const INQUIRY_SERVICES = AGENCY_SERVICES.map((s) => s.title);

export const NEEDS = ["A new brand", "More leads & sales", "Content & social", "A new website", "Something else"] as const;

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
