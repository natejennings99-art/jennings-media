import type { BookingStatus, PaymentStatus } from "@/lib/types";

export type Tone = "neutral" | "gold" | "green" | "amber" | "red" | "blue" | "violet";

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; tone: Tone; description: string }> = {
  requested: { label: "Requested", tone: "amber", description: "We received your booking and are confirming the details." },
  confirmed: { label: "Confirmed", tone: "blue", description: "Your booking is confirmed." },
  scheduled: { label: "Scheduled", tone: "violet", description: "Your photographer is assigned and on the calendar." },
  shoot_completed: { label: "Shoot Completed", tone: "gold", description: "Capture is done — files are heading to editing." },
  editing: { label: "Editing", tone: "gold", description: "Our editors are hand-finishing every image and clip." },
  ready_for_delivery: { label: "Ready for Delivery", tone: "green", description: "Final quality check before delivery." },
  delivered: { label: "Delivered", tone: "green", description: "Your media is ready to download and share." },
  cancelled: { label: "Cancelled", tone: "red", description: "This booking was cancelled." },
};

/** Customer-facing progress steps (cancelled is shown separately). */
export const PROGRESS_STEPS: BookingStatus[] = [
  "requested",
  "confirmed",
  "scheduled",
  "shoot_completed",
  "editing",
  "ready_for_delivery",
  "delivered",
];

export function progressIndex(status: BookingStatus) {
  return PROGRESS_STEPS.indexOf(status);
}

export function nextStatus(status: BookingStatus): BookingStatus | null {
  const i = progressIndex(status);
  return i >= 0 && i < PROGRESS_STEPS.length - 1 ? PROGRESS_STEPS[i + 1] : null;
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, { label: string; tone: Tone }> = {
  unpaid: { label: "Unpaid", tone: "amber" },
  pending: { label: "Pending", tone: "neutral" },
  deposit_paid: { label: "Deposit paid", tone: "blue" },
  paid: { label: "Paid", tone: "green" },
  partially_refunded: { label: "Partially refunded", tone: "violet" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export const INVOICE_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "neutral" },
  open: { label: "Open", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  void: { label: "Void", tone: "neutral" },
  uncollectible: { label: "Uncollectible", tone: "red" },
};

export const LEAD_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "gold" },
  contacted: { label: "Contacted", tone: "blue" },
  qualified: { label: "Qualified", tone: "violet" },
  won: { label: "Won", tone: "green" },
  lost: { label: "Lost", tone: "neutral" },
  spam: { label: "Spam", tone: "red" },
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single-family home",
  condo: "Condo / apartment",
  townhome: "Townhome",
  multi_family: "Multi-family",
  luxury: "Luxury estate",
  land: "Land / lot",
  commercial: "Commercial",
  rental: "Short-term rental",
  other: "Other",
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  coming_soon: "Coming soon",
  active: "Active",
  pending: "Pending",
  sold: "Sold",
  for_rent: "For rent",
  not_listed: "Not listed",
};

export const ARRIVAL_WINDOWS = [
  { value: "morning", label: "Morning", hint: "8 – 11 AM" },
  { value: "midday", label: "Midday", hint: "11 AM – 2 PM" },
  { value: "afternoon", label: "Afternoon", hint: "2 – 6 PM" },
  { value: "flexible", label: "Flexible", hint: "Any time" },
] as const;

export const MEDIA_CATEGORY_META: Record<string, { label: string; singular: string }> = {
  photos: { label: "Photos", singular: "Photo" },
  videos: { label: "Videos", singular: "Video" },
  drone: { label: "Drone", singular: "Drone file" },
  floor_plans: { label: "Floor Plans", singular: "Floor plan" },
  tours: { label: "3D Tours", singular: "Tour" },
  documents: { label: "Documents", singular: "Document" },
};
