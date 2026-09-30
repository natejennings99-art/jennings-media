/**
 * Real estate page content. Films and stills are from our own shoots
 * (web copies in /public/media). Place names are only given where the
 * listing's city is known; everything else stays on the street name.
 */
export type Film = { slug: string; title: string; place?: string };

/** Widescreen cinematic tours (16:9 loops). */
export const CINEMATIC_FILMS: Film[] = [
  { slug: "great-falls", title: "Great Falls Estate", place: "Great Falls, VA" },
  { slug: "mansion", title: "Estate Outdoor Living", place: "DMV" },
  { slug: "tunlaw-terrace", title: "Tunlaw Rd NW Penthouse", place: "Washington, DC" },
  { slug: "arlington-dining", title: "Arlington Residence", place: "Arlington, VA" },
  { slug: "mclean", title: "McLean Residence", place: "McLean, VA" },
];

/** Vertical listing reels (9:16 loops), best performers first. */
export const LISTING_REELS: Film[] = [
  { slug: "fairmont", title: "2933 N Fairmont St", place: "Falls Church, VA" },
  { slug: "tunlaw-penthouse", title: "Tunlaw Rd NW Penthouse", place: "Washington, DC" },
  { slug: "cobble-pond", title: "8182 Cobble Pond Way", place: "Manassas, VA" },
  { slug: "kagera", title: "17455 Kagera Dr", place: "Lopez Realtors" },
  { slug: "murnane", title: "10009 Murnane St" },
  { slug: "garland", title: "7906 Garland Ave" },
  { slug: "eh-chandelier", title: "Emerald Heights Ct" },
  { slug: "arnon-chapel", title: "9722 Arnon Chapel Rd", place: "Great Falls, VA" },
  { slug: "stoic-pool", title: "224 Stoic St", place: "Leesburg, VA" },
  { slug: "takoma-sunroom", title: "7812 Takoma Ave", place: "Takoma Park, MD" },
  { slug: "seventeenth-st", title: "1401 17th St NW", place: "Washington, DC" },
  { slug: "isherwood", title: "1603 Isherwood St NE", place: "Washington, DC" },
  { slug: "lake-shore", title: "1701 Lake Shore Crest" },
  { slug: "sugarberry", title: "10465 Sugarberry" },
  { slug: "westmoreland", title: "6513 Westmoreland Ave" },
  { slug: "holyoke", title: "6406 Holyoke Dr" },
];


export const RE_STEPS = [
  { n: "01", title: "Pick your package", text: "Choose a package or build your own. Your exact total, including any travel fee, shows before you pay." },
  { n: "02", title: "Choose a time", text: "Select a date and time that works. Want golden hour? Pick twilight and we plan the shoot around sunset." },
  { n: "03", title: "We shoot", text: "We arrive with pro cameras, a gimbal and a drone, and handle the whole property while you get on with your day." },
  { n: "04", title: "Download & list", text: "Your photos, film and floor plan land in your dashboard, ready for the MLS, your website and social." },
] as const;

export const RE_FAQ = [
  { q: "How does booking work?", a: "Choose a package or individual services, pick a date and time, and confirm — it takes a couple of minutes. You'll see your exact price, including any travel fee, before you pay." },
  { q: "What areas do you cover?", a: "Tampa Bay — Tampa, St. Petersburg, Clearwater and the surrounding cities — plus Washington, D.C., Northern Virginia and the Maryland suburbs. Inside our core areas there's no travel fee; farther out adds a small per-mile fee shown at checkout." },
  { q: "Can I add services to a package?", a: "Yes. Every package can be extended with add-ons such as drone photos, a vertical reel, a 3D tour, floor plans or virtual twilight, and each one updates your total as you choose." },
  { q: "Do you make vertical videos for social media?", a: "Yes. Alongside the widescreen listing film we cut a 9:16 reel for Instagram, TikTok and Shorts, with captions and a hook in the first second." },
  { q: "How do I pay?", a: "You can pay in full online, put down a deposit, or choose pay-later where it's offered. Payments are processed securely by Stripe." },
  { q: "Who is this for?", a: "Agents, teams, brokerages, builders and homeowners. If you're listing a property and want it to stand out, we'll make it look its best." },
] as const;

export const RE_AREAS = ["Tampa Bay, FL", "Washington, DC", "Northern Virginia", "Maryland suburbs"] as const;
