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

/**
 * City landing pages. Real estate photography and listing video lead; marketing services sit
 * underneath. `description` may contain "{price}", which the page fills from the live catalog
 * (e.g. "Photos from $175 · packages from $250") so no page quotes a stale floor price.
 * Keep `seoTitle` at 43 characters or fewer: the " | Jennings Media" suffix takes the rest of 60.
 */
export type Location = {
  slug: string;
  city: string;
  locality: string;
  region: string;
  seoTitle: string;
  description: string;
  /** Short city name for headings ("St. Pete"). */
  short: string;
  headline: string;
  intro: string;
  areas: string[];
  /** What the housing stock looks like and how we shoot it. */
  local: string[];
  /** Notes on how listings in this market get marketed. */
  market: string[];
  faqs: Faq[];
  work: string[];
};

const TRAVEL_FL = "Inside our core Tampa Bay area there's no travel fee. Addresses farther out add a small per-mile fee, and the exact total is shown before you pay.";

export const LOCATIONS: Location[] = [
  {
    slug: "tampa",
    city: "Tampa, FL",
    locality: "Tampa",
    region: "FL",
    short: "Tampa",
    seoTitle: "Real Estate Photographer in Tampa, FL",
    description: "Tampa real estate photography, cinematic listing video and drone for agents. {price}. Next-day photos. Call or text to book.",
    headline: "Tampa real estate photography & listing video.",
    intro: "We're based in Tampa and shoot listing photos, cinematic property films, vertical reels and drone for agents, teams and builders across the city, from Seminole Heights bungalows to Westshore condos and new builds in New Tampa. We also run ads and social content for local businesses.",
    areas: ["Downtown Tampa", "Channelside", "Harbour Island", "Hyde Park", "Davis Islands", "Seminole Heights", "Tampa Heights", "Westshore", "Carrollwood", "New Tampa", "Temple Terrace", "Brandon", "Riverview", "Wesley Chapel"],
    local: [
      "Tampa listings range widely in a short drive. Historic bungalows in Seminole Heights and Tampa Heights have smaller rooms, original wood floors and front porches, so we shoot them with careful lens choices that keep rooms honest and verticals straight. Downtown, Channelside and Harbour Island condos sell on the view and the building, so we time the shoot for good window light and add amenity and skyline frames.",
      "Farther out, New Tampa, Carrollwood, Brandon and Riverview are mostly newer single-family homes on larger lots with pools and screened lanais. Those sell on space and outdoor living, which is where a drone frame of the lot and a short walk-through film help most. Every photo is bracketed and edited by hand so windows, skies and color look the way the home looks in person.",
    ],
    market: [
      "Most buyers first see a Tampa listing as a thumbnail on a phone, so the first photo and the first second of video do the heavy lifting. We deliver MLS-sized photos the next morning, and a vertical reel you can post to Instagram, TikTok and Shorts the day the listing goes live.",
      "Parts of the city sit close to Tampa International, Peter O. Knight and MacDill Air Force Base, so drone shoots need an airspace check. We look up every address before booking and tell you up front if it can't be flown.",
    ],
    faqs: [
      { q: "How much does real estate photography cost in Tampa?", a: "Our listing photography starts from the price shown on this page and scales with the size of the home. Packages that add a floor plan, drone, a property website or a film start higher. Your exact total, including any travel fee, is shown before you pay." },
      { q: "How fast do I get my photos?", a: "Photos are delivered the next morning, ready for the MLS. Films and reels take about 48 hours." },
      { q: "Do you charge a travel fee in Tampa?", a: TRAVEL_FL },
      { q: "Can you fly a drone at my Tampa listing?", a: "Usually, but not always. Much of Tampa sits in controlled airspace around Tampa International, Peter O. Knight and MacDill. We check the exact address before booking, request FAA authorization where it's needed, and tell you up front if the address can't be flown." },
    ],
    work: [],
  },
  {
    slug: "st-petersburg",
    city: "St. Petersburg, FL",
    locality: "St. Petersburg",
    region: "FL",
    short: "St. Pete",
    seoTitle: "St. Pete Real Estate Photography & Video",
    description: "St. Petersburg real estate photos, listing films and drone for agents in Old Northeast, Snell Isle, downtown and the beaches. {price}.",
    headline: "St. Pete real estate photography & listing video.",
    intro: "From Old Northeast bungalows and Snell Isle waterfront to the downtown condo towers on Beach Drive, we shoot listing photos, cinematic films and drone for St. Petersburg agents. We also make reels and run ads for restaurants, studios and shops in the Grand Central and Edge districts. We're a short drive across the bay in Tampa.",
    areas: ["Old Northeast", "Snell Isle", "Downtown St. Pete", "Shore Acres", "Riviera Bay", "Crescent Lake", "Grand Central", "Kenwood", "Gulfport", "St. Pete Beach", "Treasure Island"],
    local: [
      "St. Pete's older neighborhoods, like Old Northeast, Kenwood and Crescent Lake, are full of 1920s bungalows and Mediterranean Revival homes with brick streets out front. Those homes sell on character, so we photograph the details buyers come for, such as original floors, built-ins and porches, alongside clean, bright room shots.",
      "Snell Isle, Shore Acres and Riviera Bay are about the water: docks, seawalls and canal or bay views. There, the exterior and aerial frames often matter more than the kitchen. Downtown and beach condos sell on the view and the building, so we plan around window light and include the amenities.",
    ],
    market: [
      "Waterfront and beach listings in Pinellas often draw out-of-town buyers who tour online first. A walk-through film and a vertical reel give them a feel for the home and the neighborhood before they book a flight.",
      "Downtown St. Pete sits next to Albert Whitted Airport, and the north end of the county is near St. Pete–Clearwater International, so drone work is checked address by address before we book it.",
    ],
    faqs: [
      { q: "Do you charge to travel from Tampa to St. Pete?", a: `St. Petersburg is inside our core service area. ${TRAVEL_FL}` },
      { q: "Can you fly a drone over downtown St. Pete or the beaches?", a: "Often, with the right authorization. Downtown is close to Albert Whitted Airport, so many addresses need FAA approval through LAANC. We check every address before booking and tell you up front if it can't be flown." },
      { q: "Do you shoot condos?", a: "Yes. For condos we focus on the view, natural light and the building's amenities, and we coordinate access with the association or front desk if needed." },
    ],
    work: [],
  },
  {
    slug: "clearwater",
    city: "Clearwater, FL",
    locality: "Clearwater",
    region: "FL",
    short: "Clearwater",
    seoTitle: "Clearwater Real Estate Photography & Video",
    description: "Clearwater real estate photos, listing films and drone for agents on Clearwater Beach, Island Estates, Sand Key and Belleair. {price}.",
    headline: "Clearwater real estate photography & listing video.",
    intro: "Clearwater Beach condos, Island Estates waterfront and Belleair homes sell on visuals. We shoot the photos, aerials and listing films that make them stand out, and we create content for local businesses and vacation-rental owners. We're based in Tampa, about 30 minutes across the Courtney Campbell.",
    areas: ["Clearwater Beach", "Island Estates", "Sand Key", "Belleair", "Belleair Bluffs", "Dunedin", "Safety Harbor", "Largo", "Palm Harbor", "Oldsmar", "Indian Rocks Beach"],
    local: [
      "Clearwater Beach and Sand Key are mostly condos and townhomes where the Gulf view is the selling point. We shoot those around the best light for the view and include the pool, beach access and building amenities. Island Estates homes sit on canals with docks and boat lifts, so we show the water access clearly from the ground and, where airspace allows, from the air.",
      "Inland, Belleair, Dunedin, Safety Harbor and Palm Harbor have a mix of older ranch homes, renovated cottages and larger estates. Those listings sell on condition and lot, so we keep rooms bright and true to size and add exterior frames that show the yard and the street.",
    ],
    market: [
      "Many Clearwater buyers are second-home and out-of-state buyers who shortlist from photos and video. Vacation-rental owners need the same visuals for their listing pages, and the same shoot can cover both.",
      "Parts of Clearwater sit near St. Pete–Clearwater International and Clearwater Air Park, so we check each address for drone airspace before booking.",
    ],
    faqs: [
      { q: "Is Clearwater in your service area?", a: `Yes. Clearwater is inside our core service area. ${TRAVEL_FL}` },
      { q: "Can you shoot a vacation rental?", a: "Yes. The same photos, film and reel work for a sale listing or a rental listing page. Tell us how the property will be listed and we'll plan the shot list around it." },
      { q: "Can you fly a drone on Clearwater Beach?", a: "Often, but every address is checked first because parts of the area sit near St. Pete–Clearwater International and Clearwater Air Park. We request FAA authorization where it's needed and tell you up front if an address can't be flown." },
    ],
    work: [],
  },
  {
    slug: "south-tampa",
    city: "South Tampa, FL",
    locality: "Tampa",
    region: "FL",
    short: "South Tampa",
    seoTitle: "South Tampa Real Estate Photos & Video",
    description: "Real estate photos, listing films and drone for South Tampa agents: Hyde Park, Palma Ceia, Bayshore, Davis Islands and Beach Park. {price}.",
    headline: "South Tampa real estate photography & listing video.",
    intro: "South Tampa is home base. We shoot listing photos, cinematic films and drone for agents selling in Hyde Park, Palma Ceia, Bayshore Beautiful, Davis Islands, Beach Park and Ballast Point, from bungalows to new-build moderns. We also make reels and run ads for shops and restaurants on Howard and MacDill.",
    areas: ["Hyde Park", "Palma Ceia", "Bayshore Beautiful", "Davis Islands", "Beach Park", "Ballast Point", "Sunset Park", "Parkland Estates", "SoHo", "Port Tampa", "Interbay"],
    local: [
      "South Tampa is a mix of 1920s bungalows and Mediterranean homes in Hyde Park and Palma Ceia, and newer two-story moderns built where older homes stood. The older homes sell on character, so we photograph original details and keep smaller rooms looking true to size. The new builds sell on finishes, height and light, so we shoot them bright with wide, straight lines.",
      "Bayshore, Davis Islands, Beach Park and Ballast Point add water to the story: bay views, seawalls and docks. Those listings get exterior and twilight frames, and a short film that shows how the home sits on the water.",
    ],
    market: [
      "South Tampa listings often compete with several similar homes on nearby streets, so the photos and the first seconds of the film decide which one buyers open. A vertical reel helps the listing travel on Instagram and in neighborhood groups.",
      "MacDill Air Force Base sits at the tip of the peninsula and Peter O. Knight Airport is on Davis Islands. Some South Tampa addresses can't be flown at all, so we check every address before booking a drone and shoot from the ground if needed.",
    ],
    faqs: [
      { q: "Can you fly a drone in South Tampa?", a: "It depends on the address. South Tampa sits close to MacDill Air Force Base and Peter O. Knight Airport, and some addresses can't be flown. We check yours before booking, request FAA authorization where it's allowed, and tell you up front if the film has to be shot from the ground." },
      { q: "Do you charge a travel fee in South Tampa?", a: "No. South Tampa is home base and inside our core service area, so there's no travel fee." },
      { q: "Can you do twilight photos for a bayfront listing?", a: "Yes. Twilight photography is booked as its own shoot around sunset, or you can add a virtual twilight edit to your best exterior photo." },
    ],
    work: [],
  },
  {
    slug: "westchase",
    city: "Westchase, FL",
    locality: "Tampa",
    region: "FL",
    short: "Westchase",
    seoTitle: "Westchase Real Estate & Event Photography",
    description: "Real estate photos, video and drone for Westchase-area agents, plus event photography across northwest Tampa. {price}.",
    headline: "Westchase real estate & event photography.",
    intro: "From Westchase golf-course homes to Town 'n' Country and Citrus Park, we shoot listing photos, films and drone for agents. We also photograph and film corporate events, team outings and community nights across northwest Tampa.",
    areas: ["Westchase", "Town 'n' Country", "Citrus Park", "Carrollwood", "Northdale", "Oldsmar", "Odessa", "Keystone"],
    local: [
      "Westchase is mostly planned neighborhoods of single-family homes and townhomes built from the 1990s on, many backing onto the golf course, ponds or preserve. Those listings sell on layout, light and the view out the back, so we shoot the main rooms wide and bright and make sure the backyard, pool and lanai get their own frames.",
      "Town 'n' Country and Carrollwood have more ranch homes from earlier decades, often renovated. For those we show the updates clearly and keep rooms true to size. Odessa and Keystone add larger lots and lakefront homes, where a drone frame of the property and the water helps buyers understand the land.",
    ],
    market: [
      "Many Westchase-area buyers are families relocating for schools and commute, and they compare several similar homes online before touring. A floor plan and a walk-through film help a listing stand out from homes with the same builder layout.",
      "Westchase sits northwest of Tampa International, so drone shoots in parts of the area need an airspace check and sometimes FAA authorization. We check every address before booking.",
    ],
    faqs: [
      { q: "Do you shoot events in Westchase?", a: "Yes. We photograph and film corporate events, team outings and community nights across northwest Tampa. See our event page for examples and how booking works." },
      { q: "Do you include a floor plan?", a: "Floor plans are included in every package and can be added to a photo-only booking. They help buyers compare homes with similar builder layouts." },
      { q: "Is there a travel fee to Westchase?", a: TRAVEL_FL },
    ],
    work: [],
  },
  {
    slug: "washington-dc",
    city: "Washington, DC",
    locality: "Washington",
    region: "DC",
    short: "DC",
    seoTitle: "DC Real Estate Photography & Listing Video",
    description: "Real estate photography, cinematic listing films and vertical reels across Washington, DC, Northern Virginia and Maryland. {price}.",
    headline: "DC real estate photography & listing video.",
    intro: "We've been filming and photographing listings across Washington, D.C., Northern Virginia and Maryland since 2024, from Great Falls estates to rowhouses and penthouses in the District. Most of the films on this site were shot here. We also make content for DMV brands and events.",
    areas: ["Washington, DC", "Arlington", "Alexandria", "Falls Church", "McLean", "Great Falls", "Fairfax", "Leesburg", "Dumfries", "Bethesda", "Silver Spring", "Takoma Park"],
    local: [
      "DC listings are often rowhouses and condos where space is tight and light comes from one or two sides. We shoot those with careful lens choices so rooms look true to size, and we lean on natural window light. Penthouses and condos with terraces sell on the outdoor space and the view, so those get their own frames and film moments.",
      "Across the river and out in the suburbs, homes in McLean, Great Falls and Falls Church are larger, with long driveways, wooded lots and finished basements. Those listings get a fuller shot list and a cinematic film that walks buyers through the home in the order they'd tour it.",
    ],
    market: [
      "You can see our DC work in the listing films on this site, including Great Falls, Falls Church and Tunlaw Road penthouse projects.",
      "Most of the District sits inside the Washington DC Flight Restricted Zone, where drone flights generally aren't possible without special federal approval. We check every address, and most DC listings are shot from the ground.",
    ],
    faqs: [
      { q: "Can you fly a drone in DC?", a: "Usually not. Most of the District and nearby Virginia and Maryland sit inside the Washington DC Flight Restricted Zone. We check every address before booking and shoot from the ground where flying isn't allowed." },
      { q: "Is there a travel fee in the DMV?", a: "There's no travel fee inside the District. Addresses farther out in Virginia and Maryland may add a small per-mile fee, shown before you pay." },
      { q: "Do you make vertical reels for DC listings?", a: "Yes. Alongside the widescreen film we cut a 9:16 reel for Instagram, TikTok and Shorts." },
    ],
    work: ["great-falls-estate", "2933-north-fairmont-street", "tunlaw-penthouse", "district-cup"],
  },
];

export const findLocation = (slug: string) => LOCATIONS.find((l) => l.slug === slug) ?? null;
