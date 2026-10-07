/**
 * The free 15-second test reel offer (/test-reel) for venues in DC metro and Miami.
 * Copy is a promise we can keep: one short vertical reel, filmed at golden hour or
 * after dark, delivered within 48 hours, theirs to post. No results claims.
 */
export const VENUE_TYPES = ["Rooftop bar", "Boutique hotel", "Yacht charter", "Nightlife & lounge", "Spa", "Restaurant", "Something else"] as const;

export const REEL_CITIES = ["DC metro", "Miami"] as const;

export const FILM_EVENINGS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Flexible"] as const;

export const TEST_REEL_AUDIENCE = [
  { title: "Rooftop bars", body: "Skyline, sunset and the first rounds of the night." },
  { title: "Boutique hotels", body: "Lobby, suites and the pool — the stay, in fifteen seconds." },
  { title: "Yacht charters", body: "Out on the water at golden hour, from deck to wake." },
  { title: "Nightlife, lounges & spas", body: "The room, the lighting and the details your guests post about." },
];

export const TEST_REEL_INCLUDES = [
  "One 15-second vertical reel (9:16), cut for Instagram, TikTok and Reels",
  "Filmed on site at golden hour or after dark — whichever shows your space best",
  "Edited, colour-graded and delivered within 48 hours of the shoot",
  "Yours to post — no cost, no contract",
];

export const TEST_REEL_STEPS = [
  { title: "Tell us about your space", body: "Two minutes on the form below. We reply to confirm a time." },
  { title: "We film one evening", body: "A short, low-key visit around golden hour or after dark — no need to close anything." },
  { title: "Your reel in 48 hours", body: "A finished 15-second vertical reel, ready to post." },
];

/** Our own vertical work shown beside the offer — real reels from /public/media/video. */
export const TEST_REEL_SAMPLES = [
  { slug: "tunlaw-penthouse", label: "Tunlaw Rd NW Penthouse", kind: "Skyline terrace" },
  { slug: "pet-grand-hotel", label: "Pet Grand Hotel", kind: "Hospitality promo" },
  { slug: "polo", label: "District Cup", kind: "Event recap" },
];
