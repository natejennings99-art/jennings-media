import "server-only";
import { adminCreatorApplicant } from "@/lib/email/templates";
import { env, features } from "@/lib/env";
import { DISCIPLINE_LABELS, creatorSchema, fieldErrorsOf, looksLikeBot } from "./schemas";
import { RATE_LIMIT_MESSAGE, leadIp, notifyAfterResponse, overLimit, saveRow } from "./deliver";
import type { ActionResult } from "@/lib/types";

export type CreatorResult = ActionResult<{ name: string; delivered?: boolean }>;

/**
 * /join (and POST /api/join): a photographer or videographer applies to the creator network.
 * validate → rate-limit → insert into creator_applicants (status 'applied') → email Nate.
 */
export async function submitCreatorApplication(raw: Record<string, unknown>): Promise<CreatorResult> {
  const parsed = creatorSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "A few details need attention.", fieldErrors: fieldErrorsOf(parsed.error) };
  const d = parsed.data;
  const first = d.name.split(" ")[0];
  if (looksLikeBot(d)) return { ok: true, data: { name: first } };

  const { ip, ipHash } = await leadIp();
  if (await overLimit("join", ip, ipHash, "creator_applicants", 3)) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const availability = [d.availability.join(", "), d.availability_notes].filter(Boolean).join(" — ") || null;
  const { id, saved } = await saveRow(
    "creator_applicants",
    {
      name: d.name,
      email: d.email,
      phone: d.phone,
      discipline: d.discipline,
      portfolio_url: d.portfolio_url,
      gear: d.gear,
      day_rate: d.day_rate,
      availability,
      notes: d.notes,
      status: "applied",
      source_path: "/join",
      ip_hash: ipHash,
    },
    "/join"
  );

  notifyAfterResponse(
    "admin_creator_applicant",
    (brand) =>
      adminCreatorApplicant(brand, {
        name: d.name,
        email: d.email,
        phone: d.phone,
        discipline: DISCIPLINE_LABELS[d.discipline],
        portfolioUrl: d.portfolio_url,
        gear: d.gear,
        dayRate: `$${d.day_rate.toLocaleString("en-US")}/day`,
        availability,
        notes: d.notes,
        adminUrl: id ? `${env.siteUrl}/admin/creators?focus=${id}` : `mailto:${d.email}`,
      }),
    { replyTo: d.email }
  );

  return { ok: true, data: { name: first, delivered: saved || features.email } };
}
