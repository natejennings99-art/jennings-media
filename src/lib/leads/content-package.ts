import "server-only";
import { adminCallRequest } from "@/lib/email/templates";
import { features } from "@/lib/env";
import { CONTENT_PACKAGE } from "@/lib/content/content-package";
import { contentPackageSchema, fieldErrorsOf, looksLikeBot } from "./schemas";
import { RATE_LIMIT_MESSAGE, adminLeadUrl, leadIp, notifyAfterResponse, overLimit, saveContactLead } from "./deliver";
import type { ActionResult } from "@/lib/types";

export type CallRequestResult = ActionResult<{ name: string; delivered?: boolean }>;

/**
 * /content-package "book a call" (and POST /api/content-package). Stored as a contact lead so it
 * shows up in Admin → Contact leads next to everything else, then emailed to Nate.
 */
export async function submitCallRequest(raw: Record<string, unknown>): Promise<CallRequestResult> {
  const parsed = contentPackageSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "A few details need attention.", fieldErrors: fieldErrorsOf(parsed.error) };
  const d = parsed.data;
  const first = d.name.split(" ")[0];
  if (looksLikeBot(d)) return { ok: true, data: { name: first } };

  const { ip, ipHash } = await leadIp();
  if (await overLimit("content-package", ip, ipHash, "contact_leads")) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const message = [`${CONTENT_PACKAGE.name} (${CONTENT_PACKAGE.priceLabel}) — call request`, `Business: ${d.business}`, `Phone: ${d.phone}`, `Best time to call: ${d.best_time}`].join("\n");
  const { id, saved } = await saveContactLead(
    { name: d.name, company: d.business, email: d.email ?? "", phone: d.phone, need: CONTENT_PACKAGE.name, services: ["Content Production"], budget: CONTENT_PACKAGE.priceLabel, message, source_path: "/content-package" },
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
        packageName: CONTENT_PACKAGE.name,
        price: CONTENT_PACKAGE.priceLabel,
        adminUrl: adminLeadUrl(id, `tel:${d.phone.replace(/[^\d+]/g, "")}`),
      }),
    { replyTo: d.email }
  );

  return { ok: true, data: { name: first, delivered: saved || features.email } };
}
