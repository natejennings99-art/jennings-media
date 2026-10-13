"use server";

import { after } from "next/server";
import { z } from "zod";
import { clean, optionalClean } from "@/lib/booking/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, env } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { adminNewLead } from "@/lib/email/templates";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import { FILM_EVENINGS, REEL_CITIES, VENUE_TYPES } from "@/lib/content/test-reel";
import type { ActionResult } from "@/lib/types";

const NEED = "Free 15-second test reel";

const schema = z
  .object({
    business: clean(120).pipe(z.string().min(2, "Enter the business name")),
    venue: z.enum(VENUE_TYPES, { error: "Pick the closest venue type" }),
    city: z.enum(REEL_CITIES, { error: "Choose DC metro or Miami" }),
    instagram: optionalClean(80),
    name: optionalClean(120),
    email: optionalClean(254)
      .refine((s) => s === null || z.email().safeParse(s).success, "Enter a valid email")
      .transform((s) => s?.toLowerCase() ?? null),
    phone: optionalClean(30),
    evening: z.enum(FILM_EVENINGS).optional().catch(undefined),
    notes: optionalClean(1500),
    website: z.string().max(0).optional().or(z.literal("")),
    startedAt: z.coerce.number().optional(),
  })
  .refine((d) => d.email || d.phone, { path: ["email"], message: "Add an email or a phone number so we can reach you" });

export async function submitTestReel(_: unknown, form: FormData): Promise<ActionResult<{ name: string }>> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "A few details need attention.", fieldErrors };
  }
  const data = parsed.data;
  const first = (data.name ?? data.business).split(" ")[0];
  // Honeypot + "submitted in under 3 seconds" → quietly succeed for bots.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 3000)) return { ok: true, data: { name: first } };

  const ip = await clientIp();
  if (!rateLimit(`test-reel:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, error: "You've sent a few requests already — we'll be in touch soon." };

  const evening = data.evening ?? "Flexible";
  const instagram = data.instagram ? `@${data.instagram.replace(/^@+/, "")}` : null;
  const message = [
    `${NEED} request`,
    `Business: ${data.business}`,
    `Venue: ${data.venue}`,
    `City: ${data.city}`,
    instagram ? `Instagram: ${instagram}` : "",
    `Best evening to film: ${evening}`,
    data.notes ? `\n${data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const settings = await getSettings();
  const notify = (adminUrl: string) =>
    after(() =>
      sendLogged(
        "admin_new_lead",
        adminRecipients(settings),
        adminNewLead(brandOf(settings), { name: data.name ?? data.business, email: data.email ?? "", phone: data.phone, company: data.business, reason: "test_reel", message, adminUrl }),
        { replyTo: data.email }
      )
    );

  // No database yet: never bounce a lead. Same "[lead]" log line the contact form writes (the
  // nightly command-center task harvests these from Render's logs), plus email once Resend is set.
  if (!features.supabaseAdmin) {
    console.log(
      `[lead] ${JSON.stringify({ at: new Date().toISOString(), source: "/test-reel", name: data.name ?? data.business, company: data.business, email: data.email, phone: data.phone, need: NEED, services: [], budget: null, venue: data.venue, city: data.city, instagram, evening, message })}`
    );
    if (features.email) notify(data.email ? `mailto:${data.email}` : `${env.siteUrl}/admin/leads`);
    return { ok: true, data: { name: first } };
  }

  const db = createAdminClient();
  const ipHash = hashIp(ip);
  const { count } = await db.from("contact_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gt("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((count ?? 0) >= 5) return { ok: false, error: "You've sent a few requests already — we'll be in touch soon." };

  const { data: existing } = data.email ? await db.from("customers").select("id").ilike("email", data.email).maybeSingle() : { data: null };
  const { data: lead, error } = await db
    .from("contact_leads")
    .insert({
      name: data.name ?? data.business,
      company: data.business,
      email: data.email ?? "",
      phone: data.phone,
      reason: "project",
      need: NEED,
      services: [],
      budget: null,
      message,
      customer_id: existing?.id ?? null,
      source_path: "/test-reel",
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "Something went wrong. Please try again." };

  notify(`${env.siteUrl}/admin/leads?focus=${lead.id}`);
  return { ok: true, data: { name: first } };
}
