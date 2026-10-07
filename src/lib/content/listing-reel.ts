/**
 * The free 30-second listing reel offer (/free-listing-reel) for Tampa Bay agents — the landing
 * page for the Meta ads, Google Business posts and "DM REEL" captions. A promise we can keep: one
 * vertical reel of one listing, delivered within 48 hours of the shoot, theirs to post. One per
 * agent. No results claims.
 */
export const LISTING_AREAS = ["Tampa", "South Tampa", "St. Petersburg", "Clearwater", "Westchase", "Brandon / Riverview", "Elsewhere in Tampa Bay"] as const;

export const LISTING_TIMING = ["This week", "Next 2 weeks", "This month", "Already live"] as const;

export const LISTING_REEL_INCLUDES = [
  "One 30-second vertical reel (9:16) of one listing, cut for Instagram, TikTok and Facebook",
  "Filmed on site in about 45 minutes, gimbal-smooth, with the best rooms and the outdoor space",
  "Edited, colour-graded and delivered within 48 hours of the shoot",
  "Yours to post and tag — no cost, no contract, one per agent",
];

export const LISTING_REEL_STEPS = [
  { title: "Send the listing", body: "Address and go-live date on the form below. We text to pick a time." },
  { title: "We film one visit", body: "About 45 minutes on site, before or alongside your photos." },
  { title: "Your reel in 48 hours", body: "A finished 30-second vertical reel, ready to post the day you go live." },
];

export const LISTING_REEL_WHY = [
  { title: "Buyers scroll video first", body: "A vertical walkthrough gets watched where your listing photos get swiped past." },
  { title: "Sellers notice", body: "A reel of their home is the easiest thing to show at your next listing appointment." },
  { title: "No risk to try", body: "See the quality on a real listing of yours before you book a package." },
];

/** Our own vertical listing reels shown beside the offer — real work from /public/media/video. */
export const LISTING_REEL_SAMPLES = [
  { slug: "eh-chandelier", label: "Emerald Heights", kind: "Listing reel" },
  { slug: "stoic-pool", label: "224 Stoic St", kind: "Pool & exterior" },
  { slug: "arnon-chapel", label: "9722 Arnon Chapel Rd", kind: "Estate walkthrough" },
];
