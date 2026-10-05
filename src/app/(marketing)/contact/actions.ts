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
import { BUDGETS, INQUIRY_SERVICES, NEEDS } from "@/lib/content/agency";
import type { ActionResult } from "@/lib/types";

const schema = z.object({
  name: clean(120).pipe(z.string().min(2, "Enter your name")),
  company: optionalClean(120),
  email: clean(254).transform((s) => s.toLowerCase()).pipe(z.email("Enter a valid email")),
  phone: optionalClean(30),
  need: z.enum(NEEDS, { error: "Pick what you need most" }),
  services: z.array(z.enum(INQUIRY_SERVICES as [string, ...string[]])).max(8),
  budget: z.enum(BUDGETS, { error: "Choose a budget range" }),
  message: clean(4000).pipe(z.string().min(10, "Tell us a little about the project")),
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
});

export async function submitInquiry(_: unknown, form: FormData): Promise<ActionResult<{ name: string }>> {
  const parsed = schema.safeParse({
    ...Object.fromEntries(form),
    services: form.getAll("services").map(String),
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { ok: false, error: "A few details need attention.", fieldErrors };
  }
  const data = parsed.data;
  // Honeypot + "submitted in under 3 seconds" → quietly succeed for bots.
  if (data.website || (data.startedAt && Date.now() - data.startedAt < 3000)) return { ok: true, data: { name: data.name.split(" ")[0] } };

  const ip = await clientIp();
  if (!rateLimit(`inquiry:${ip}`, 5, 60 * 60 * 1000)) return { ok: false, error: "You've sent a few messages already — we'll be in touch soon." };
  const settings = await getSettings();
  const brand = brandOf(settings);
  const summary = [`Need: ${data.need}`, data.services.length ? `Services: ${data.services.join(", ")}` : "", `Budget: ${data.budget}`, "", data.message].join("\n");
  const notify = (adminUrl: string) =>
    after(async () => {
      await sendLogged(
        "admin_new_lead",
        adminRecipients(settings),
        adminNewLead(brand, { name: data.name, email: data.email, phone: data.phone, company: data.company, reason: "project", message: summary, adminUrl }),
        { replyTo: data.email }
      );
      await sendLogged("contact_auto_reply", data.email, contactAutoReply(brand, { name: data.name.split(" ")[0] }), { replyTo: settings.email });
    });

  // No database yet: never bounce a lead. Write it to the server log (a "[lead]" line the
  // nightly command-center task harvests from Render's logs), and email it too once Resend is set.
  if (!features.supabaseAdmin) {
    console.log(
      `[lead] ${JSON.stringify({ at: new Date().toISOString(), name: data.name, company: data.company, email: data.email, phone: data.phone, need: data.need, services: data.services, budget: data.budget, message: data.message })}`
    );
    if (features.email) notify(`mailto:${data.email}`);
    return { ok: true, data: { name: data.name.split(" ")[0] } };
  }

  const db = createAdminClient();
  const ipHash = hashIp(ip);
  const { count } = await db.from("contact_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gt("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((count ?? 0) >= 5) return { ok: false, error: "You've sent a few messages already — we'll be in touch soon." };

  const { data: existing } = await db.from("customers").select("id").ilike("email", data.email).maybeSingle();
  const { data: lead, error } = await db
    .from("contact_leads")
    .insert({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      reason: "project",
      need: data.need,
      services: data.services,
      budget: data.budget,
      message: data.message,
      customer_id: existing?.id ?? null,
      source_path: "/contact",
      ip_hash: ipHash,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: "Something went wrong. Please try again." };

  notify(`${env.siteUrl}/admin/leads?focus=${lead.id}`);
  return { ok: true, data: { name: data.name.split(" ")[0] } };
}
