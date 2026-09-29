"use server";

import { after } from "next/server";
import { z } from "zod";
import { clean, optionalClean } from "@/lib/booking/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, env } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { adminRecipients, brandOf, sendLogged } from "@/lib/notifications";
import { adminNewLead, contactAutoReply } from "@/lib/email/templates";
import { clientIp, hashIp, rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/types";

const schema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  company: optionalClean(120),
  phone: optionalClean(30),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  reason: z.enum(["booking", "pricing", "custom_quote", "partnership", "support", "general"]),
  message: clean(4000).pipe(z.string().min(10, "Tell us a little more")),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
});

export async function submitContact(_: unknown, form: FormData): Promise<ActionResult> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  // Honeypot + "filled in under 3 seconds" heuristics — pretend success to bots.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 3000)) return { ok: true };

  const ip = await clientIp();
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, error: "You've sent several messages recently. We'll be in touch soon!" };
  if (!features.supabaseAdmin) return { ok: false, error: "Our contact form isn't connected yet — please email us directly." };

  const db = createAdminClient();
  const ipHash = hashIp(ip);
  const { count } = await db
    .from("contact_leads")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gt("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((count ?? 0) >= 5) return { ok: false, error: "You've sent several messages recently. We'll be in touch soon!" };

  const { data: existing } = await db.from("customers").select("id").ilike("email", data.email).maybeSingle();
  const { data: lead, error } = await db
    .from("contact_leads")
    .insert({
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      reason: data.reason,
      message: data.message,
      customer_id: existing?.id ?? null,
      source_path: "/contact",
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "Something went wrong. Please try again." };

  const settings = await getSettings();
  const brand = brandOf(settings);
  after(async () => {
    await sendLogged("admin_new_lead", adminRecipients(settings), adminNewLead(brand, { ...data, adminUrl: `${env.siteUrl}/admin/leads?focus=${lead.id}` }), { replyTo: data.email });
    await sendLogged("contact_auto_reply", data.email, contactAutoReply(brand, { name: data.name.split(" ")[0] }), { replyTo: settings.email });
  });
  return { ok: true };
}
