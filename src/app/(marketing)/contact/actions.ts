"use server";

import { submitContactLead, type LeadResult } from "@/lib/leads/contact";

/** Server Action behind the contact form; the same logic answers POST /api/contact. */
export async function submitInquiry(_: unknown, form: FormData): Promise<LeadResult> {
  return submitContactLead({ ...Object.fromEntries(form), services: form.getAll("services").map(String) });
}
