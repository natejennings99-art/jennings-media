"use server";

import { after } from "next/server";
import { z } from "zod";
import { clean, optionalClean } from "@/lib/booking/schema";
import { features } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { adminNewLead } from "@/lib/email/templates";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

const schema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  phone: clean(30).pipe(z.string().min(7, "Enter a phone number we can text")),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  address: clean(200).pipe(z.string().min(5, "Enter the property address")),
  when: optionalClean(120),
  pkg: optionalClean(60),
  notes: optionalClean(2000),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
});

/**
 * Quick shoot request used while online booking (Supabase) isn't connected. Never bounces the
 * visitor: the request is always written to the server log as a "[lead]" line (harvested nightly
 * into the Growth Command Center) and emailed as well once Resend is configured.
 */
export async function requestShoot(_: unknown, form: FormData): Promise<ActionResult<{ name: string }>> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "A few details need attention.", fieldErrors };
  }
  const d = parsed.data;
  const first = d.name.split(" ")[0];
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 3000)) return { ok: true, data: { name: first } };
  const ip = await clientIp();
  if (!rateLimit(`shoot:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, error: "You've sent a few requests already — we'll be in touch soon." };

  console.log(`[lead] ${JSON.stringify({ at: new Date().toISOString(), kind: "shoot_request", name: d.name, phone: d.phone, email: d.email, address: d.address, when: d.when, package: d.pkg, notes: d.notes })}`);

  if (features.email) {
    const settings = await getSettings();
    const message = [`Shoot request${d.pkg ? ` (${d.pkg})` : ""}`, `Property: ${d.address}`, d.when ? `Preferred: ${d.when}` : "", d.notes ?? ""].filter(Boolean).join("\n");
    after(() =>
      sendLogged("admin_new_lead", adminRecipients(settings), adminNewLead(brandOf(settings), { name: d.name, email: d.email, phone: d.phone, reason: "shoot_request", message, adminUrl: `mailto:${d.email}` }), {
        replyTo: d.email,
      })
    );
  }
  return { ok: true, data: { name: first } };
}
