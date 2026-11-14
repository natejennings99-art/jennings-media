/**
 * "Book a call" — the free 15-minute call. One form, used on /book-a-call and at the
 * bottom of every industry page. Plain constants so the form and the server share them.
 */
import { INDUSTRY_PAGES } from "./industries";

export { BEST_TIMES } from "./content-package";

export const CALL_TOPICS = ["Photo", "Video", "Social content", "Not sure yet"] as const;

/** Pages that carry the form. The lead is saved with the page it came from. */
export const CALL_PAGES = ["/book-a-call", ...INDUSTRY_PAGES.map((i) => `/industries/${i.slug}`)] as [string, ...string[]];

export const CALL = {
  name: "Free 15-minute call",
  path: "/book-a-call",
  steps: [
    { title: "Send the form", body: "Name, phone and a good time. It takes about a minute." },
    { title: "Nate calls you", body: "Within one business day, at the time of day you picked." },
    { title: "You decide", body: "15 minutes. If we are a fit, we send a simple plan and a price. If not, no hard feelings." },
  ],
} as const;
