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
import { LISTING_AREAS, LISTING_TIMING } from "@/lib/content/listing-reel";
import type { ActionResult } from "@/lib/types";

const NEED = "Free 30-second listing reel";

const schema = z
  .object({
    name: clean(120).pipe(z.string().min(2, "Enter your name")),
    brokerage: optionalClean(120),
    address: clean(200).pipe(z.string().min(5, "Enter the listing address")),
    area: z.enum(LISTING_AREAS, { error: "Pick the closest area" }),
    timing: z.enum(LISTING_TIMING).optional().catch(undefined),
    instagram: optionalClean(80),
    email: optionalClean(254)
      .refine((s) => s === null || z.email().safeParse(s).success, "Enter a valid email")
      .transform((s) => s?.toLowerCase() ?? null),
    phone: optionalClean(30),
    notes: optionalClean(1500),
    website: z.string().max(0).optional().or(z.literal("")),
    startedAt: z.coerce.number().optional(),
  })
  .refine((d) => d.email || d.phone, { path: ["phone"], message: "Add a phone number or email so we can reach you" });

export async function submitListingReel(_: unknown, form: FormData): Promise<ActionResult<{ name: string }>> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "A few details need attention.", fieldErrors };
  }
  const data = parsed.data;
  const first = data.name.split(" ")[0];
  // Honeypot + "submitted in under 3 seconds" → quietly succeed for bots.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 3000)) return { ok: true, data: { name: first } };

  const ip = await clientIp();
  if (!rateLimit(`listing-reel:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, error: "You've sent a few requests already — we'll be in touch soon." };

  const timing = data.timing ?? "Not sure yet";
  const instagram = data.instagram ? `@${data.instagram.replace(/^@+/, "")}` : null;
  const message = [
    `${NEED} request`,
    `Listing: ${data.address}`,
    `Area: ${data.area}`,
    `Goes live: ${timing}`,
    data.brokerage ? `Brokerage: ${data.brokerage}` : "",
    instagram ? `Instagram: ${instagram}` : "",
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
        adminNewLead(brandOf(settings), { name: data.name, email: data.email ?? "", phone: data.phone, company: data.brokerage, reason: "listing_reel", message, adminUrl }),
        { replyTo: data.email }
      )
    );

  // No database yet: never bounce a lead. Same "[lead]" log line the contact form writes (the
  // nightly command-center task harvests these from Render's logs), plus email once Resend is set.
  if (!features.supabaseAdmin) {
    console.log(
      `[lead] ${JSON.stringify({ at: new Date().toISOString(), source: "/free-listing-reel", name: data.name, company: data.brokerage, email: data.email, phone: data.phone, need: NEED, services: ["Content Production"], budget: null, address: data.address, area: data.area, timing, instagram, message })}`
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
      name: data.name,
      company: data.brokerage,
      email: data.email ?? "",
      phone: data.phone,
      reason: "project",
      need: NEED,
      services: ["Content Production"],
      budget: null,
      message,
      customer_id: existing?.id ?? null,
      source_path: "/free-listing-reel",
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "Something went wrong. Please try again." };

  notify(`${env.siteUrl}/admin/leads?focus=${lead.id}`);
  return { ok: true, data: { name: first } };
}
