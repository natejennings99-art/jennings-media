"use server";

import { submitCallBooking, type CallBookingResult } from "@/lib/leads/call";

/** Server Action behind every "Book a call" form; POST /api/book-a-call runs the same logic. */
export async function submitCall(_: unknown, form: FormData): Promise<CallBookingResult> {
  return submitCallBooking(Object.fromEntries(form));
}
