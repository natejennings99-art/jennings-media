/**
 * REAL Jennings Media work — footage and photography from our own shoots
 * (web-optimised copies live in /public/media). Copy is factual: it describes
 * what was made, never results we can't back up. Add metrics, results and
 * client quotes in Admin → Work once you have them.
 */
import type { Client, PortfolioProject } from "@/lib/types";
import { BRAND } from "@/lib/brand";

const V = (name: string) => `/media/video/${name}.mp4`;
const W = (name: string) => `/media/work/${name}.jpg`;

let mediaSeq = 0;
const photos = (title: string, urls: string[]) =>
  urls.map((url) => ({
    id: `94000000-0000-4000-8000-${String(++mediaSeq).padStart(12, "0")}`,
    kind: "photo" as const,
    url,
    poster_url: null,
    alt: title,
    caption: null,
    width: null,
    height: null,
    sort_order: mediaSeq,
  }));

type WorkSeed = Pick<
  PortfolioProject,
  "slug" | "title" | "client_name" | "industry" | "year" | "headline" | "summary" | "categories" | "services_performed" | "execution" | "cover_image_url" | "hover_video_url" | "is_featured" | "sort_order"
> & { gallery: string[]; city?: string; state?: string };

const work = (n: number, { gallery, city, state, ...c }: WorkSeed): PortfolioProject => ({
  id: `93000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
  neighborhood: null,
  city: city ?? null,
  state: state ?? null,
  property_type: null,
  description: c.summary,
  video_url: c.hover_video_url,
  tour_url: null,
  shot_on: null,
  metrics: [],
  challenge: null,
  strategy: null,
  results: null,
  testimonial_quote: null,
  testimonial_author: null,
  testimonial_role: null,
  is_published: true,
  is_sample: false,
  media: photos(c.title, gallery),
  ...c,
});

export const REAL_CASE_STUDIES: PortfolioProject[] = [
  work(1, {
    slug: "elevate-property-group",
    title: "Elevate Property Group",
    client_name: "Elevate Property Group",
    industry: "Real Estate",
    year: 2025,
    headline: "A brokerage brand, told by its people.",
    summary: "A brand film for Elevate Property Group — the team, the culture and the energy behind the brokerage — cut vertical-first for Instagram and Reels.",
    categories: ["creative", "social"],
    services_performed: ["Brand Film", "Content Production", "Social Media"],
    execution: "A two-minute brand film shot in 4K: on-camera interviews, event coverage and branded detail shots, finished with burned-in captions for sound-off viewing.",
    cover_image_url: W("elevate-01"),
    hover_video_url: V("elevate"),
    gallery: [W("elevate-02"), W("elevate-00"), W("elevate-03")],
    is_featured: true,
    sort_order: 10,
  }),
  work(2, {
    slug: "pet-grand-hotel",
    title: "Pet Grand Hotel",
    client_name: "Pet Grand Hotel",
    industry: "Hospitality",
    year: 2025,
    headline: "Five-star energy. Four-legged guests.",
    summary: "A promo film for a luxury pet hotel — the suites, the play areas and the guests themselves — made to feel like a real hotel tour.",
    categories: ["creative", "social"],
    services_performed: ["Promo Film", "Content Production"],
    execution: "Shot in 4K across suites, play yards and grooming rooms, with on-screen labels for each room type so the film doubles as a virtual tour.",
    cover_image_url: W("pet-grand-hotel-03"),
    hover_video_url: V("pet-grand-hotel"),
    gallery: [W("pet-grand-hotel-01"), W("pet-grand-hotel-00"), W("pet-grand-hotel-02")],
    is_featured: true,
    sort_order: 20,
  }),
  work(3, {
    slug: "great-falls-estate",
    title: "Great Falls Estate",
    client_name: "Private listing",
    industry: "Luxury Real Estate",
    year: 2025,
    headline: "Selling the backyard before the front door.",
    summary: "A cinematic listing film for a Great Falls, Virginia estate — outdoor kitchen, pool house and grounds — shot horizontal for YouTube and the MLS, with a vertical cut for social.",
    categories: ["creative", "web"],
    services_performed: ["Listing Film", "Social Cut"],
    execution: "A gimbal-led walkthrough of the grounds and outdoor living spaces, finished in 4K, plus a separate vertical edit for Instagram.",
    cover_image_url: "/media/video/great-falls.jpg",
    hover_video_url: V("great-falls"),
    gallery: [W("great-falls-00"), W("great-falls-01"), W("great-falls-02"), W("great-falls-03")],
    city: "Great Falls",
    state: "VA",
    is_featured: true,
    sort_order: 30,
  }),
  work(4, {
    slug: "right-fit-summer-kick-off",
    title: "Summer Kick Off",
    client_name: "Right Fit Realty",
    industry: "Real Estate",
    year: 2025,
    headline: "The company cookout, captured as a brand story.",
    summary: "Event coverage for Right Fit Realty's Summer Kick Off — agents, families and partners on camera — edited into a recap film and short vertical highlights.",
    categories: ["social", "creative"],
    services_performed: ["Event Film", "Social Media", "Content Production"],
    execution: "Run-and-gun 4K coverage with quick on-camera interviews, sponsor moments and branded details, cut into a four-minute recap and vertical highlights.",
    cover_image_url: W("right-fit-01"),
    hover_video_url: V("right-fit"),
    gallery: [W("right-fit-03"), W("right-fit-00"), W("right-fit-02")],
    is_featured: true,
    sort_order: 40,
  }),
  work(5, {
    slug: "smart-settlements",
    title: "Smart Settlements",
    client_name: "Smart Settlements",
    industry: "Real Estate Services",
    year: 2025,
    headline: "Putting faces to the closing table.",
    summary: "A brand video for a settlement team — the office, the people and the closing table — edited into a tight one-minute piece for social.",
    categories: ["creative", "social"],
    services_performed: ["Brand Video", "Content Production"],
    execution: "Walk-and-talk intros, meeting-room b-roll and team moments, shot in 4K and edited to just over a minute.",
    cover_image_url: W("smart-settlements-00"),
    hover_video_url: V("smart-settlements"),
    gallery: [W("smart-settlements-01"), W("smart-settlements-02"), W("smart-settlements-03")],
    is_featured: false,
    sort_order: 50,
  }),
  work(6, {
    slug: "2933-north-fairmont-street",
    title: "2933 N Fairmont Street",
    client_name: "Listing launch",
    industry: "Residential Real Estate",
    year: 2025,
    headline: "Just listed — and hard to scroll past.",
    summary: "Launch media for a five-bed, four-bath Falls Church home listed at $849,900: an agent-led listing film, HDR photography and a vertical reel for Instagram.",
    categories: ["creative", "social"],
    services_performed: ["Listing Film", "Photography", "Social Media"],
    execution: "An agent-on-camera walkthrough shot in 4K, HDR interiors for the MLS and a captioned reel posted with the listing announcement.",
    cover_image_url: W("fairmont-deck"),
    hover_video_url: V("fairmont"),
    gallery: [W("fairmont-living"), W("fairmont-01"), W("fairmont-lounge")],
    city: "Falls Church",
    state: "VA",
    is_featured: false,
    sort_order: 60,
  }),
  work(7, {
    slug: "17455-kagera-drive",
    title: "17455 Kagera Drive",
    client_name: "Lopez Realtors",
    industry: "Residential Real Estate",
    year: 2025,
    headline: "A listing film with a host.",
    summary: "Listing launch for Jenny Lopez of Lopez Realtors — an agent-hosted film, HDR photography and social cuts for the Just Listed push.",
    categories: ["creative", "social"],
    services_performed: ["Listing Film", "Photography", "Social Media"],
    execution: "An agent-hosted tour filmed in 4K, paired with a full HDR photo set and a vertical reel for Instagram.",
    cover_image_url: W("kagera-living"),
    hover_video_url: V("kagera"),
    gallery: [W("kagera-kitchen"), W("kagera-00"), W("kagera-bedroom")],
    is_featured: false,
    sort_order: 70,
  }),
];

/** Brands we've made work for (from delivered projects). */
export const REAL_CLIENTS: Client[] = [
  "Elevate Property Group",
  "Pet Grand Hotel",
  "Right Fit Realty",
  "Groom Guy",
  "Smart Settlements",
  "Lopez Realtors",
  "WAR Team",
  "Reynolds EmpowerHome Team",
].map((name, i) => ({
  id: `95000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  name,
  logo_url: null,
  website_url: null,
  sort_order: (i + 1) * 10,
  is_published: true,
  is_sample: false,
}));

export type Reel = { slug: string; label: string; kind: string; href: string };

/** Vertical loops for the "made for the feed" wall (/public/media/video/<slug>.mp4 + .jpg). */
export const REELS: Reel[] = [
  { slug: "jennings-ad", label: BRAND.name, kind: "Agency spot", href: BRAND.instagram },
  { slug: "elevate", label: "Elevate Property Group", kind: "Brand film", href: "/work/elevate-property-group" },
  { slug: "pet-grand-hotel", label: "Pet Grand Hotel", kind: "Promo film", href: "/work/pet-grand-hotel" },
  { slug: "right-fit", label: "Right Fit Realty", kind: "Event recap", href: "/work/right-fit-summer-kick-off" },
  { slug: "fairmont", label: "2933 N Fairmont St", kind: "Listing reel", href: "/work/2933-north-fairmont-street" },
  { slug: "smart-settlements", label: "Smart Settlements", kind: "Brand video", href: "/work/smart-settlements" },
  { slug: "kagera", label: "Lopez Realtors", kind: "Listing film", href: "/work/17455-kagera-drive" },
  { slug: "lake-shore", label: "1701 Lake Shore Crest", kind: "Listing reel", href: BRAND.instagram },
  { slug: "fall-festival", label: "Fall Festival", kind: "Event recap", href: BRAND.instagram },
  { slug: "sugarberry", label: "10465 Sugarberry", kind: "Listing film", href: BRAND.instagram },
];

/** Horizontal clips for the showreel preview montage. */
export const REEL_CLIPS = [1, 2, 3, 4, 5].map((n) => ({ src: `/media/video/reel-${n}.mp4`, poster: `/media/video/reel-${n}.jpg` }));
export const SHOWREEL_FILM = "/media/video/film.mp4";
export const HERO_VIDEO = "/media/video/hero.mp4";

export type Frame = { src: string; video?: string; title: string; kind: string; shape: "wide" | "tall" };

/** "Shot by us" strip — only our own footage and photography. */
export const FRAMES: Frame[] = [
  { src: "/media/video/reel-1.jpg", video: "/media/video/reel-1.mp4", title: "Waterfront home", kind: "Drone", shape: "wide" },
  { src: "/media/work/pet-grand-hotel-03.jpg", title: "Pet Grand Hotel", kind: "Brand film", shape: "tall" },
  { src: "/media/work/fairmont-deck.jpg", title: "2933 N Fairmont St", kind: "Photography", shape: "wide" },
  { src: "/media/work/elevate-01.jpg", title: "Elevate Property Group", kind: "Interview", shape: "tall" },
  { src: "/media/video/great-falls.jpg", video: "/media/video/great-falls.mp4", title: "Great Falls Estate", kind: "Listing film", shape: "wide" },
  { src: "/media/work/sugarberry-dining.jpg", title: "10465 Sugarberry", kind: "Photography", shape: "wide" },
  { src: "/media/work/right-fit-01.jpg", title: "Right Fit Realty", kind: "Event film", shape: "tall" },
  { src: "/media/video/reel-5.jpg", video: "/media/video/reel-5.mp4", title: "Neighborhood reveal", kind: "Drone", shape: "wide" },
  { src: "/media/work/kagera-living.jpg", title: "17455 Kagera Dr", kind: "Photography", shape: "wide" },
];
