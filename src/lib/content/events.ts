/** Events, sports & lifestyle footage — shot by our team (web loops live in /public/media/video). */
import type { Film } from "./real-estate";

export const SPORTS_WIDE: Film[] = [
  { slug: "stadium", title: "Night game", place: "Baseball" },
  { slug: "baseball", title: "Diamond view", place: "Baseball" },
];

export const SPORTS_REELS: Film[] = [
  { slug: "nba", title: "Courtside energy", place: "Basketball" },
  { slug: "hoops-crowd", title: "Crowd roar", place: "Basketball" },
  { slug: "football", title: "Game day", place: "Football" },
  { slug: "polo-field", title: "On the field", place: "Polo" },
  { slug: "polo-horses", title: "Full gallop", place: "Polo" },
];

export const LIVE_REELS: Film[] = [
  { slug: "concert", title: "Reggae Rise Up", place: "Live music" },
  { slug: "nightlife", title: "After dark", place: "Nightlife" },
];

export const TRAVEL_REELS: Film[] = [
  { slug: "rooftop-pool", title: "Golden-hour rooftop", place: "Hotels & resorts" },
  { slug: "cenote", title: "Hidden cenote", place: "Resorts & travel" },
  { slug: "beach", title: "Shoreline", place: "Resorts & travel" },
];

export const EVENT_OFFERS = [
  { title: "Event coverage", text: "Games, shows, launches and parties captured in 4K, from the big moments to the small ones in between." },
  { title: "Highlight reels", text: "Fast, vertical-first edits built for Instagram, TikTok and Shorts, with a hook in the first second." },
  { title: "Brand & sponsor content", text: "Footage that gives partners and sponsors something worth posting, with your logo where it belongs." },
  { title: "Always-on social", text: "A steady stream of behind-the-scenes and recap content that keeps your audience coming back." },
] as const;
