/**
 * Validation for the public lead forms (contact, /join, /content-package).
 * Pure zod — no server imports — so the rules are unit-testable and shared by the
 * Server Actions and the JSON endpoints under /api.
 */
import { z } from "zod";
import { clean, optionalClean } from "@/lib/booking/schema";
import { BUDGETS, INQUIRY_SERVICES, NEEDS } from "@/lib/content/agency";
import { AVAILABILITY_OPTIONS, DISCIPLINES } from "@/lib/content/creators";
import { BEST_TIMES } from "@/lib/content/content-package";

export { AVAILABILITY_OPTIONS, DISCIPLINES, DISCIPLINE_LABELS, type Discipline } from "@/lib/content/creators";
export { BEST_TIMES } from "@/lib/content/content-package";

/** Honeypot + "submitted in under 3 seconds" fields every public form carries. */
export const botFields = {
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
};

export function looksLikeBot(d: { website?: string; startedAt?: number }) {
  return Boolean(d.website) || Boolean(d.startedAt && Date.now() - d.startedAt < 3000);
}

/** Optional free text that also tolerates a missing key (JSON posts omit empty fields). */
export const optionalText = (max: number) => z.preprocess((v) => (v === undefined ? null : v), optionalClean(max));

export const optionalEmail = z.preprocess(
  (v) => (v === undefined ? null : v),
  optionalClean(254)
    .refine((s) => s === null || z.email().safeParse(s).success, "Enter a valid email")
    .transform((s) => s?.toLowerCase() ?? null)
);

const phoneDigits = (v: string) => v.replace(/\D/g, "").length;
export const requiredPhone = z.preprocess((v) => (v == null ? "" : v), clean(30).refine((v) => phoneDigits(v) >= 10 && phoneDigits(v) <= 15, "Enter a valid phone number"));

/* ------------------------------------------------------------------ contact */

export const contactSchema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  company: optionalText(120),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  phone: optionalText(30),
  need: z.enum(NEEDS, { error: "Pick what you need most" }),
  services: z.array(z.enum(INQUIRY_SERVICES as [string, ...string[]])).max(8),
  budget: z.enum(BUDGETS, { error: "Choose a budget range" }),
  message: clean(4000).pipe(z.string().min(10, "Tell us a little about the project")),
  ...botFields,
});
export type ContactInput = z.infer<typeof contactSchema>;

/* -------------------------------------------------------------- /join */

/** Accepts "example.com" as well as "https://example.com"; rejects anything that isn't http(s). */
export const portfolioUrl = clean(500)
  .pipe(z.string().min(4, "Add a link to your work"))
  .transform((s) => (/^https?:\/\//i.test(s) ? s : `https://${s}`))
  .refine((s) => {
    try {
      const u = new URL(s);
      return (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".");
    } catch {
      return false;
    }
  }, "Enter a valid link (Instagram, website, Vimeo, Drive…)");

export const creatorSchema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  phone: requiredPhone,
  discipline: z.enum(DISCIPLINES, { error: "Pick photo, video or both" }),
  portfolio_url: portfolioUrl,
  gear: optionalText(1500),
  day_rate: z.coerce.number({ error: "Enter your day rate as a number" }).int("Whole dollars, please").min(0, "Enter your day rate").max(100000, "That day rate looks too high"),
  availability: z.array(z.enum(AVAILABILITY_OPTIONS)).max(AVAILABILITY_OPTIONS.length).default([]),
  availability_notes: optionalText(500),
  notes: optionalText(2000),
  ...botFields,
});
export type CreatorInput = z.infer<typeof creatorSchema>;

/* -------------------------------------------------------- /content-package */

export const contentPackageSchema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  business: clean(160).pipe(z.string().min(2, "Enter your business name")),
  phone: requiredPhone,
  best_time: z.enum(BEST_TIMES, { error: "Pick the best time to call" }),
  email: optionalEmail,
  ...botFields,
});
export type ContentPackageInput = z.infer<typeof contentPackageSchema>;

/** zod issues → { field: message } for the forms. */
export function fieldErrorsOf(error: z.ZodError) {
  return Object.fromEntries(error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]));
}
