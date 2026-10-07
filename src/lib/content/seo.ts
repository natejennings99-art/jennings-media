/** Search-focused copy for service and location landing pages. */
export type Faq = { q: string; a: string };
export type ServiceSeo = { seoTitle: string; description: string; plan: string; package?: string; categories: string[]; faqs: Faq[] };

export const SERVICE_SEO: Record<string, ServiceSeo> = {
  "lead-generation": {
    seoTitle: "Lead Generation Agency in Tampa, FL",
    description: "Lead generation for brokerages, realtors and local businesses: offers, landing pages, instant lead alerts and follow-up that turns clicks into booked calls.",
    plan: "growth",
    package: "lead-gen-funnel",
    categories: ["paid-media", "web"],
    faqs: [
      { q: "How quickly do leads start coming in?", a: "Once the funnel and ads are live, leads can start arriving within days. The first month is about learning which offers and audiences convert best, then scaling what works." },
      { q: "Do you work with realtors and brokerages?", a: "Yes — real estate is where we started. We also build lead generation for local service businesses, retail, hospitality and personal brands." },
      { q: "Where do the leads go?", a: "Straight to your inbox or CRM the moment they come in, with automated email or text follow-up so no lead goes cold." },
    ],
  },
  "paid-media": {
    seoTitle: "Google Ads & Meta Ads Agency in Tampa, FL",
    description: "Google Ads management and Meta ads for Tampa Bay businesses: creative, targeting, retargeting and conversion tracking, optimized weekly for cost per lead.",
    plan: "growth",
    package: "ad-launch-sprint",
    categories: ["paid-media"],
    faqs: [
      { q: "How much should I spend on ads?", a: "We recommend a starting budget based on your market and goals. Ad spend is paid directly to Meta and Google, separate from our management fee." },
      { q: "Do you make the ad creative too?", a: "Yes. Our production team shoots and edits the videos and photos your ads run on, so the creative and the targeting are built together." },
      { q: "Do you manage Google Ads for Tampa businesses?", a: "Yes. We build and manage Google Search and Performance Max campaigns for Tampa Bay businesses, with call and form tracking so every lead is counted, and we report on cost per lead every week." },
      { q: "Can you take over my existing campaigns?", a: "Yes. We start with an audit of your account, keep what's working and rebuild what isn't." },
    ],
  },
  "ai-automation": {
    seoTitle: "AI Agents for Business in Tampa, FL",
    description: "Custom AI agents that answer questions, qualify leads and book appointments 24/7 on your website, inbox and DMs — trained on your business.",
    plan: "scale",
    package: "ai-agent-setup",
    categories: [],
    faqs: [
      { q: "What can an AI agent do for my business?", a: "Answer common questions instantly, qualify new leads, book appointments on your calendar and hand the hottest leads to you — day or night." },
      { q: "Will it sound like us?", a: "Yes. We train it on your services, pricing, FAQs and tone, then review real conversations during the first 30 days to tune it." },
      { q: "Does it connect to the tools we already use?", a: "We connect agents to your calendar, CRM, email and website chat so every conversation ends in a clear next step." },
    ],
  },
  "social-media": {
    seoTitle: "Social Media Agency in Tampa, FL",
    description: "Social media management for Instagram, TikTok, Facebook, LinkedIn and YouTube: strategy, posting, reels shot in-house and monthly reporting.",
    plan: "starter",
    categories: ["social"],
    faqs: [
      { q: "Which platforms do you manage?", a: "Instagram, TikTok, Facebook, LinkedIn and YouTube — we focus on the two or three where your clients actually spend time." },
      { q: "Do you create the content or do we?", a: "We do. We plan the calendar, shoot and edit reels and photos in-house, write the captions and post for you." },
      { q: "How do we know it's working?", a: "You get a monthly report on reach, engagement, followers and the leads or inquiries social brought in." },
    ],
  },
  "content-production": {
    seoTitle: "Video & Photo Production in Tampa, FL",
    description: "Brand films, reels, photography and drone footage shot in 4K and edited in-house — for social media, ads, websites and property listings.",
    plan: "starter",
    package: "brand-film",
    categories: ["creative"],
    faqs: [
      { q: "What do you shoot?", a: "Brand and promo films, event recaps, product and team photography, real estate listings and drone footage — all in 4K." },
      { q: "Do we get vertical versions for social?", a: "Yes. Every shoot can be cut vertical for Instagram, TikTok and Shorts as well as horizontal for your website and YouTube." },
      { q: "How fast is delivery?", a: "Turnaround depends on the project; we agree a delivery date before the shoot so you can plan your launch around it." },
    ],
  },
  "web-design": {
    seoTitle: "Websites & Funnels in Tampa, FL",
    description: "Fast, conversion-first websites and landing pages with tracking built in — designed to turn ad and social traffic into inquiries.",
    plan: "growth",
    package: "lead-gen-funnel",
    categories: ["web"],
    faqs: [
      { q: "Do you build full websites or just landing pages?", a: "Both. Many clients start with a high-converting landing page for their ads, then move to a full site." },
      { q: "Will my site show up on Google?", a: "Every site ships with fast load times, clean structure, metadata and schema so search engines can understand and rank it." },
      { q: "Can you connect it to my CRM?", a: "Yes — forms, booking and chat can feed straight into your CRM and trigger instant follow-up." },
    ],
  },
  "brand-strategy": {
    seoTitle: "Brand Strategy & Identity in Tampa, FL",
    description: "Positioning, messaging and visual identity that make your business the obvious choice — and keep every ad, post and page on message.",
    plan: "growth",
    categories: ["branding"],
    faqs: [
      { q: "What does brand strategy include?", a: "Who you serve, what you promise, how you sound and how you look — delivered as positioning, messaging and a visual identity with guidelines." },
      { q: "We already have a logo. Do we need this?", a: "A logo is one piece. Strategy makes sure your ads, content and website all say the same compelling thing." },
    ],
  },
  "seo-content": {
    seoTitle: "SEO & Local Search in Tampa, FL",
    description: "Technical SEO, Google Business Profile, local pages and content that ranks — so clients find you when they're ready to buy.",
    plan: "growth",
    categories: [],
    faqs: [
      { q: "How long does SEO take?", a: "Technical fixes and Google Business Profile improvements can help within weeks; content and rankings compound over several months." },
      { q: "Do you help with Google Business Profile and reviews?", a: "Yes — profile setup and optimization, photos, posts and a simple system for collecting reviews from happy clients." },
    ],
  },
};

export type Location = { slug: string; city: string; locality: string; region: string; seoTitle: string; description: string; headline: string; intro: string; areas: string[]; work: string[] };

export const LOCATIONS: Location[] = [
  {
    slug: "tampa",
    city: "Tampa, FL",
    locality: "Tampa",
    region: "FL",
    seoTitle: "Marketing Agency in Tampa, FL",
    description: "Lead generation, Meta & Google Ads, AI agents and 4K content for brokerages, realtors and entrepreneurs across Tampa Bay.",
    headline: "Tampa Bay's content & growth team.",
    intro: "Based in Tampa, we film, photograph and market for realtors, brokerages and local businesses across Tampa Bay — from South Tampa and Westchase to St. Petersburg and Clearwater — with the same team and playbook we built in Washington, D.C.: content that stops the scroll, ads that bring in leads and AI that follows up instantly.",
    areas: ["Tampa", "South Tampa", "Westchase", "St. Petersburg", "Clearwater", "Largo", "Brandon", "Riverview", "Wesley Chapel", "Lakeland", "Sarasota"],
    work: [],
  },
  {
    slug: "st-petersburg",
    city: "St. Petersburg, FL",
    locality: "St. Petersburg",
    region: "FL",
    seoTitle: "Listing Media & Marketing in St. Petersburg, FL",
    description: "Listing photos, films and drone for St. Pete agents, plus reels, Meta & Google Ads for local businesses. Old Northeast, Snell Isle, downtown and the beaches.",
    headline: "St. Pete's listing media & growth team.",
    intro: "From Old Northeast bungalows and Snell Isle waterfront to the downtown condo towers on Beach Drive, we shoot listing photos, cinematic films and drone for St. Petersburg agents, and we make reels and run ads for the restaurants, studios and shops opening across the Grand Central and Edge districts. We're a short drive across the bay in Tampa.",
    areas: ["Old Northeast", "Snell Isle", "Downtown St. Pete", "Shore Acres", "Riviera Bay", "Crescent Lake", "Grand Central", "Kenwood", "Gulfport", "St. Pete Beach", "Treasure Island"],
    work: [],
  },
  {
    slug: "clearwater",
    city: "Clearwater, FL",
    locality: "Clearwater",
    region: "FL",
    seoTitle: "Listing Media & Marketing in Clearwater, FL",
    description: "Listing photos, films and drone for Clearwater Beach and Pinellas agents, plus reels and Meta & Google Ads for local businesses and vacation rentals.",
    headline: "Clearwater's listing media & growth team.",
    intro: "Clearwater Beach condos, Island Estates waterfront and Belleair homes sell on visuals. We shoot the photos, aerials and listing films that make them stand out, and we create content and run ads for Clearwater businesses and vacation-rental owners. We're based in Tampa, about 30 minutes across the Courtney Campbell.",
    areas: ["Clearwater Beach", "Island Estates", "Sand Key", "Belleair", "Belleair Bluffs", "Dunedin", "Safety Harbor", "Largo", "Palm Harbor", "Oldsmar", "Indian Rocks Beach"],
    work: [],
  },
  {
    slug: "south-tampa",
    city: "South Tampa, FL",
    locality: "Tampa",
    region: "FL",
    seoTitle: "Listing Media & Marketing in South Tampa",
    description: "Listing photos, films and drone for South Tampa agents: Hyde Park, Palma Ceia, Bayshore, Davis Islands and Beach Park. Packages from $450.",
    headline: "South Tampa's listing media team.",
    intro: "South Tampa is home base. We shoot listing photos, cinematic films and drone for agents selling in Hyde Park, Palma Ceia, Bayshore Beautiful, Davis Islands, Beach Park and Ballast Point, from bungalows to new-build moderns, and we make reels and run ads for the shops and restaurants on Howard and MacDill.",
    areas: ["Hyde Park", "Palma Ceia", "Bayshore Beautiful", "Davis Islands", "Beach Park", "Ballast Point", "Sunset Park", "Parkland Estates", "SoHo", "Port Tampa", "Interbay"],
    work: [],
  },
  {
    slug: "westchase",
    city: "Westchase, FL",
    locality: "Tampa",
    region: "FL",
    seoTitle: "Listing Media & Event Photography in Westchase",
    description: "Listing photos, video and drone for Westchase-area agents, plus corporate and event photography for Westchase, Town 'n' Country and Citrus Park.",
    headline: "Westchase listing & event media.",
    intro: "From Westchase golf-course homes to Town 'n' Country and Citrus Park, we shoot listing photos, films and drone for agents, and we photograph and film corporate events, team outings and community nights across northwest Tampa, with same-week recaps.",
    areas: ["Westchase", "Town 'n' Country", "Citrus Park", "Carrollwood", "Northdale", "Oldsmar", "Odessa", "Keystone"],
    work: [],
  },
  {
    slug: "washington-dc",
    city: "Washington, DC",
    locality: "Washington",
    region: "DC",
    seoTitle: "Marketing Agency in Washington, DC",
    description: "A Washington, DC marketing agency for brokerages, realtors and entrepreneurs across the DMV: lead generation, Meta & Google Ads, AI agents and 4K content.",
    headline: "The DMV's content & growth team.",
    intro: "We've been filming, photographing and marketing across Washington, D.C., Northern Virginia and Maryland since 2024 — from Great Falls estates to the District Cup.",
    areas: ["Washington, DC", "Arlington", "Alexandria", "Falls Church", "McLean", "Great Falls", "Fairfax", "Leesburg", "Dumfries", "Bethesda", "Silver Spring", "Takoma Park"],
    work: ["district-cup", "great-falls-estate", "2933-north-fairmont-street"],
  },
];

export const findLocation = (slug: string) => LOCATIONS.find((l) => l.slug === slug) ?? null;
