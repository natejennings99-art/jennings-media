import "server-only";
import { adminCallRequest } from "@/lib/email/templates";
import { features } from "@/lib/env";
import { CALL } from "@/lib/content/call";
import { callSchema, fieldErrorsOf, looksLikeBot } from "./schemas";
import { RATE_LIMIT_MESSAGE, adminLeadUrl, leadIp, notifyAfterResponse, overLimit, saveContactLead } from "./deliver";
import type { ActionResult } from "@/lib/types";

export type CallBookingResult = ActionResult<{ name: string; delivered?: boolean }>;

/**
 * "Book a call" (/book-a-call, the industry pages and POST /api/book-a-call), end to end:
 * validate → rate-limit → save to contact_leads (source = the page the form was on) → email Nate.
 * It shows up in Admin → Contact leads next to every other lead and counts in /api/stats.
 * `delivered` is false only when the lead reached neither the database nor an email; the form
 * then offers a one-tap text or email so the request still gets to Nate.
 */
export async function submitCallBooking(raw: Record<string, unknown>): Promise<CallBookingResult> {
  const parsed = callSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "A few details need attention.", fieldErrors: fieldErrorsOf(parsed.error) };
  const d = parsed.data;
  const first = d.name.split(" ")[0];
  if (looksLikeBot(d)) return { ok: true, data: { name: first } };

  const { ip, ipHash } = await leadIp();
  if (await overLimit("book-a-call", ip, ipHash, "contact_leads")) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const message = [
    `${CALL.name} — call request`,
    d.business ? `Business: ${d.business}` : null,
    `Phone: ${d.phone}`,
    `Best time to call: ${d.best_time}`,
    d.topic ? `Wants to talk about: ${d.topic}` : null,
    d.note ? `Note: ${d.note}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const { id, saved } = await saveContactLead(
    { name: d.name, company: d.business, email: d.email ?? "", phone: d.phone, need: CALL.name, services: d.topic ? [d.topic] : [], budget: null, message, source_path: d.page },
    ipHash
  );

  notifyAfterResponse(
    "admin_call_request",
    (brand) =>
      adminCallRequest(brand, {
        name: d.name,
        business: d.business,
        phone: d.phone,
        bestTime: d.best_time,
        email: d.email,
        topic: d.topic,
        note: d.note,
        source: d.page,
        adminUrl: adminLeadUrl(id, `tel:${d.phone.replace(/[^\d+]/g, "")}`),
      }),
    { replyTo: d.email }
  );

  return { ok: true, data: { name: first, delivered: saved || features.email } };
}
