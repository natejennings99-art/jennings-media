import "server-only";
import { adminNewLead, contactAutoReply } from "@/lib/email/templates";
import { features } from "@/lib/env";
import { contactSchema, fieldErrorsOf, looksLikeBot } from "./schemas";
import { RATE_LIMIT_MESSAGE, adminLeadUrl, leadIp, notifyAfterResponse, overLimit, saveContactLead } from "./deliver";
import type { ActionResult } from "@/lib/types";

export type LeadResult = ActionResult<{ name: string; delivered?: boolean }>;

/**
 * The contact form (/contact and POST /api/contact), end to end:
 * validate → rate-limit → save to contact_leads → email Nate (+ auto-reply to the sender).
 * `delivered` is false only when the lead reached neither the database nor an email, in which
 * case the UI offers a one-tap text/email hand-off.
 */
export async function submitContactLead(raw: Record<string, unknown>): Promise<LeadResult> {
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "A few details need attention.", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = parsed.data;
  const first = data.name.split(" ")[0];
  if (looksLikeBot(data)) return { ok: true, data: { name: first } };

  const { ip, ipHash } = await leadIp();
  if (await overLimit("inquiry", ip, ipHash, "contact_leads")) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const summary = `${[`Need: ${data.need}`, data.services.length ? `Services: ${data.services.join(", ")}` : null, `Budget: ${data.budget}`].filter(Boolean).join("\n")}\n\n${data.message}`;
  const { id, saved } = await saveContactLead(
    { name: data.name, company: data.company, email: data.email, phone: data.phone, need: data.need, services: data.services, budget: data.budget, message: data.message, source_path: "/contact" },
    ipHash
  );

  notifyAfterResponse(
    "admin_new_lead",
    (brand) => adminNewLead(brand, { name: data.name, email: data.email, phone: data.phone, company: data.company, reason: "project", message: summary, adminUrl: adminLeadUrl(id, `mailto:${data.email}`) }),
    { replyTo: data.email, also: { to: data.email, template: "contact_auto_reply", build: (brand) => contactAutoReply(brand, { name: first }) } }
  );

  return { ok: true, data: { name: first, delivered: saved || features.email } };
}
