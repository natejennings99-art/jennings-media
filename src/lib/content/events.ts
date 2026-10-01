/** Events page content — client events and sports, filmed and photographed by our team. */
import type { Film } from "./real-estate";

/** Widescreen event films (16:9 loops). */
export const EVENT_FILMS: Film[] = [
  { slug: "stadium", title: "Night at the ballpark", place: "Elevate Property Group" },
  { slug: "silos-yard", title: "The Yard at 2 Silos", place: "Right Fit Realty" },
  { slug: "silos-crowd", title: "Golden hour at 2 Silos", place: "Right Fit Realty" },
];

/** Vertical event reels (9:16 loops). */
export const EVENT_REELS: Film[] = [
  { slug: "epg-field", title: "Night at the ballpark", place: "Elevate Property Group" },
  { slug: "epg-stands", title: "In the stands", place: "Elevate Property Group" },
  { slug: "epg-suite", title: "The suite", place: "Elevate Property Group" },
  { slug: "epg-photo-wall", title: "Step-and-repeat", place: "Elevate Property Group" },
  { slug: "polo", title: "The District Cup", place: "Polo" },
  { slug: "fall-festival", title: "Fall Festival", place: "Community event" },
  { slug: "right-fit", title: "Summer Kick Off", place: "Right Fit Realty" },
  { slug: "pet-grand-hotel", title: "Pet Grand Hotel", place: "Hospitality" },
  { slug: "isaia", title: "Isaia", place: "Retail" },
  { slug: "elevate", title: "Elevate Property Group", place: "Brand film" },
];

export const EVENT_OFFERS = [
  { title: "Event coverage", text: "Photo and 4K video from the first guest to the last toast, with a team that stays out of the way." },
  { title: "Same-week recaps", text: "A one-minute recap and vertical highlights ready to post while people are still talking about it." },
  { title: "Photo galleries", text: "Edited event photos, from step-and-repeat portraits to the candid moments in between." },
  { title: "Sponsor & brand content", text: "Footage that gives partners and sponsors something worth sharing, with your logo where it belongs." },
] as const;
