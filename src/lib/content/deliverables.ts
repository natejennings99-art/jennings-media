/**
 * Plain descriptions of each kind of deliverable named in a case study's "services_performed".
 * They explain what the format is and what it's for; they never claim results, views or sales.
 */
import type { PortfolioProject } from "@/lib/types";

export const DELIVERABLE_COPY: Record<string, string> = {
  "Listing Film":
    "A listing film is a walkthrough of the home shot in 4K on a stabilized gimbal and sequenced so a viewer can follow the layout from one space to the next. It's made for the MLS video link, the listing website, YouTube and the agent's email blast, so buyers can understand the layout before they book a showing.",
  "Social Cut":
    "The social cut is a separate vertical edit of the same footage, reframed for phones and trimmed to the strongest moments so it works as an Instagram or Reels post.",
  "Vertical Reel":
    "The vertical reel is a 9:16 edit cut from the same shoot, built to be posted on Instagram, TikTok and Shorts. It leads with the strongest shot so it holds attention in a feed, and it reads with the sound off.",
  Photography:
    "The photography is a set of edited stills, from wide shots to close details, delivered in web and full-resolution sizes so the same set works for websites, social posts and print.",
  "Social Media":
    "For social, the footage is cut into posts sized for Instagram and Reels, with captions so they read with the sound off, ready to publish alongside the announcement.",
  Reels:
    "The reels are short vertical edits made for Instagram and Reels, cut fast and framed for a phone screen.",
  "Brand Film":
    "A brand film introduces a business through its people and its space rather than a sales pitch. It's shot in 4K and edited for the places the business actually shows up: its website, Instagram and Reels.",
  "Brand Video":
    "A brand video is a short, social-length piece that puts faces to a business: who works there, where they work and what it's like to deal with them.",
  "Promo Film":
    "A promo film shows a venue the way a guest would experience it, room by room, so it can work as both an advert and a virtual tour.",
  "Content Production":
    "Content production covers the shoot itself and the edit: planning the shot list, filming on the day and delivering finished files in the formats each platform needs.",
  "Event Film":
    "An event film is a recap of the day: arrivals, speeches or key moments, the crowd and the details, cut into a short highlight for social and, where it's useful, a longer version.",
  "Event Coverage":
    "Event coverage means moving with the action all day and capturing the moments that tell the story of the event, then cutting them into a short recap.",
  "Event Photography":
    "Event photography is a set of edited stills from the event, covering the people, the venue and the details, delivered for social posts, newsletters and the next event's promotion.",
};

/** Where to send a reader who wants the same kind of work. */
export function relatedOffer(p: Pick<PortfolioProject, "industry" | "services_performed">) {
  const s = p.services_performed.join(" ");
  if (/Listing/i.test(s)) {
    return { href: "/listing-video-tampa", label: "Listing video in Tampa Bay", also: { href: "/pricing", label: "real estate pricing" } };
  }
  if (/Event/i.test(s) || /Event/i.test(p.industry ?? "")) return { href: "/events", label: "Event photography & video", also: { href: "/contact", label: "start a project" } };
  return { href: "/services/content-production", label: "Video & photo production", also: { href: "/contact", label: "start a project" } };
}

/** "Listing film · Falls Church, VA" — what it is and where, only from data the project already has. */
export function caseEyebrow(p: Pick<PortfolioProject, "services_performed" | "city" | "state">) {
  const what = p.services_performed[0] ?? "";
  const where = p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : "";
  return [what, where].filter(Boolean).join(" · ");
}
