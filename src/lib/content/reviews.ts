import type { Testimonial } from "@/lib/types";

/**
 * Real client reviews, shown in the "What clients say" slider (home, /real-estate,
 * /free-listing-reel) while the database is off. Empty on purpose: the slider shows
 * nothing until a real review is added here.
 *
 * Only paste reviews a client actually wrote (copy them from the Google Business Profile),
 * word for word, with their permission. Never invent or edit one.
 *
 * Example (fill in from a real Google review, then remove the comment markers):
 *
 *   {
 *     id: "google-1",
 *     author_name: "[CLIENT NAME]",
 *     author_title: "[e.g. Realtor]",
 *     company: "[BROKERAGE] · Google review",
 *     quote: "[ADD REAL REVIEW]",
 *     rating: null,
 *     avatar_url: null,
 *     is_featured: false,
 *     is_published: true,
 *     is_sample: false,
 *     sort_order: 1,
 *   },
 */
export const REAL_REVIEWS: Testimonial[] = [];
