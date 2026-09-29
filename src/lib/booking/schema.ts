import { z } from "zod";
import { PAYMENT_OPTIONS } from "@/lib/types";

/** Strips control characters and trims; rejects anything longer than `max`. */
export const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max, `Keep this under ${max} characters`));

export const optionalClean = (max: number) =>
  z
    .union([clean(max), z.null(), z.undefined()])
    .transform((v) => (v ? v : null));

export const phoneSchema = clean(30).refine((v) => v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15, "Enter a valid phone number");

export const PROPERTY_TYPES = ["single_family", "condo", "townhome", "multi_family", "luxury", "land", "commercial", "rental", "other"] as const;
export const LISTING_STATUSES = ["coming_soon", "active", "pending", "sold", "for_rent", "not_listed"] as const;

export const propertySchema = z.object({
  address_line1: clean(160).pipe(z.string().min(3, "Enter the street address")),
  address_line2: optionalClean(80),
  city: clean(80).pipe(z.string().min(2, "Enter the city")),
  state: clean(2).transform((s) => s.toUpperCase()).pipe(z.string().regex(/^[A-Z]{2}$/, "Use a 2-letter state")),
  postal_code: clean(10).pipe(z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP")),
  property_type: z.enum(PROPERTY_TYPES),
  square_feet: z.coerce.number().int().min(200, "Enter the approximate square footage").max(100000),
  bedrooms: z.coerce.number().min(0).max(50).nullable().optional(),
  bathrooms: z.coerce.number().min(0).max(50).nullable().optional(),
  listing_status: z.enum(LISTING_STATUSES).nullable().optional(),
  occupancy: z.enum(["occupied", "vacant"]),
  access_instructions: optionalClean(600),
  special_instructions: optionalClean(1500),
  mls_number: optionalClean(40),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  arrival_window: z.enum(["morning", "midday", "afternoon", "flexible"]).nullable().optional(),
});

export const selectionSchema = z.object({
  packageId: z.uuid().nullable(),
  serviceIds: z.array(z.uuid()).max(40),
  serviceQuantities: z.record(z.string(), z.number().int().min(1).max(100)).optional(),
  addOns: z.array(z.object({ id: z.uuid(), quantity: z.number().int().min(1).max(100) })).max(40),
});

export const customerSchema = z.object({
  first_name: clean(60).pipe(z.string().min(1, "Enter your first name")),
  last_name: clean(60).pipe(z.string().min(1, "Enter your last name")),
  company: optionalClean(120),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  phone: phoneSchema,
  brokerage: optionalClean(120),
  billing_same_as_property: z.boolean().default(true),
  billing_address: z
    .object({
      line1: optionalClean(160),
      city: optionalClean(80),
      state: optionalClean(2),
      postal_code: optionalClean(10),
    })
    .nullable()
    .optional(),
  marketing_opt_in: z.boolean().default(false),
  sms_opt_in: z.boolean().default(false),
});

export const bookingInputSchema = z.object({
  property: propertySchema,
  selection: selectionSchema,
  slotStart: z.iso.datetime({ offset: true }).nullable(),
  customer: customerSchema,
  paymentOption: z.enum(PAYMENT_OPTIONS),
  promoCode: optionalClean(40),
  acceptTerms: z.literal(true, { error: "Please accept the booking terms" }),
  /** Honeypot — real users never fill this. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type SelectionInput = z.infer<typeof selectionSchema>;

/** Flattens zod issues to { "customer.email": "message" }. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
