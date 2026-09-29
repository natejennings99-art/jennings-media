"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/data/public";
import { clean } from "@/lib/booking/schema";
import type { ActionResult } from "@/lib/types";

/* Field coercions shared by resource schemas */
const text = (max = 200) => z.preprocess((v) => (v === undefined || v === null ? "" : String(v)), clean(max));
const nullableText = (max = 2000) => text(max).transform((v) => v || null);
const slug = z.preprocess((v) => String(v ?? "").trim().toLowerCase(), z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes"));
const bool = z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean());
const int = (min = 0, max = 1_000_000) => z.coerce.number().int().min(min).max(max);
const nullableInt = (min = 0, max = 1_000_000) => z.preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().int().min(min).max(max).nullable());
const nullableNumber = z.preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().nullable());
const money = z.preprocess((v) => (v === "" || v === null || v === undefined ? 0 : v), z.coerce.number().min(0).max(1_000_000)).transform((d) => Math.round(d * 100));
const nullableMoney = z.preprocess((v) => (v === "" || v === null || v === undefined ? null : v), z.coerce.number().min(0).max(1_000_000).nullable()).transform((d) => (d === null ? null : Math.round(d * 100)));
const list = z.preprocess(
  (v) => (Array.isArray(v) ? v : String(v ?? "").split(/\n|,/)).map((s) => String(s).trim()).filter(Boolean),
  z.array(z.string().max(300)).max(60)
);
const lowerList = list.transform((a) => a.map((s) => s.toLowerCase()));
const uuidList = z.preprocess((v) => (Array.isArray(v) ? v : []), z.array(z.uuid()).max(60));
const tiers = z
  .preprocess((v) => (Array.isArray(v) ? v : []), z.array(z.object({ max_sqft: z.preprocess((x) => (x === "" || x === null ? null : x), z.coerce.number().int().positive().nullable()), price: z.coerce.number().min(0) })).max(12))
  .transform((rows) => rows.map((r) => ({ max_sqft: r.max_sqft, price_cents: Math.round(r.price * 100) })).sort((a, b) => (a.max_sqft ?? Infinity) - (b.max_sqft ?? Infinity)));
const jsonObject = z.preprocess((v) => {
  if (typeof v !== "string") return v ?? {};
  try {
    return v.trim() ? JSON.parse(v) : {};
  } catch {
    return "__invalid__";
  }
}, z.record(z.string(), z.unknown(), { error: "Enter valid JSON" }));
const url = z.preprocess((v) => (v === "" || v === undefined ? null : v), z.url().nullable());
const datetime = z.iso.datetime({ offset: true });

interface ResourceDef {
  table: string;
  tag?: string;
  paths?: string[];
  schema: z.ZodType<Record<string, unknown>>;
  /** Keys that are relations handled after the main upsert. */
  relations?: (db: Awaited<ReturnType<typeof assertAdmin>>["supabase"], id: string, data: Record<string, unknown>) => Promise<void>;
  strip?: string[];
}

const RESOURCES: Record<string, ResourceDef> = {
  services: {
    table: "services",
    tag: TAGS.catalog,
    paths: ["/", "/services", "/pricing"],
    schema: z.object({
      name: text(120).pipe(z.string().min(2)),
      slug,
      category: z.enum(["photography", "video", "drone", "tour", "floor_plan", "editing", "web", "marketing", "branding"]),
      tagline: nullableText(200),
      description: nullableText(3000),
      features: list,
      icon: nullableText(40),
      image_url: url,
      pricing_model: z.enum(["flat", "sqft", "per_unit"]),
      base_price_cents: money,
      price_tiers: tiers,
      unit_label: nullableText(40),
      max_quantity: nullableInt(1, 100),
      duration_minutes: int(0, 600),
      turnaround_hours: nullableInt(0, 720),
      scheduling_rules: jsonObject,
      is_bookable: bool,
      is_addon_eligible: bool,
      is_featured: bool,
      is_active: bool,
      sort_order: int(0, 10000),
      seo_title: nullableText(70),
      seo_description: nullableText(160),
    }) as unknown as z.ZodType<Record<string, unknown>>,
  },
  packages: {
    table: "packages",
    tag: TAGS.catalog,
    paths: ["/", "/pricing"],
    strip: ["service_ids"],
    schema: z.object({
      name: text(80).pipe(z.string().min(2)),
      slug,
      tagline: nullableText(200),
      description: nullableText(2000),
      features: list,
      base_price_cents: money,
      price_tiers: tiers,
      badge: nullableText(30),
      image_url: url,
      turnaround_text: nullableText(80),
      is_featured: bool,
      is_active: bool,
      sort_order: int(0, 10000),
      service_ids: uuidList,
    }) as unknown as z.ZodType<Record<string, unknown>>,
    relations: async (db, id, data) => {
      const ids = data.service_ids as string[];
      await db.from("package_services").delete().eq("package_id", id);
      if (ids.length) await db.from("package_services").insert(ids.map((service_id) => ({ package_id: id, service_id })));
    },
  },
  add_ons: {
    table: "add_ons",
    tag: TAGS.catalog,
    paths: ["/pricing"],
    strip: ["trigger_service_ids"],
    schema: z.object({
      name: text(80).pipe(z.string().min(2)),
      slug,
      description: nullableText(300),
      service_id: z.preprocess((v) => (v ? v : null), z.uuid().nullable()),
      pricing_model: z.enum(["flat", "sqft", "per_unit"]),
      price_cents: money,
      unit_label: nullableText(40),
      max_quantity: nullableInt(1, 100),
      duration_minutes: int(0, 600),
      icon: nullableText(40),
      show_always: bool,
      is_active: bool,
      sort_order: int(0, 10000),
      trigger_service_ids: uuidList,
    }) as unknown as z.ZodType<Record<string, unknown>>,
    relations: async (db, id, data) => {
      const ids = data.trigger_service_ids as string[];
      await db.from("add_on_triggers").delete().eq("add_on_id", id);
      if (ids.length) await db.from("add_on_triggers").insert(ids.map((service_id) => ({ add_on_id: id, service_id })));
    },
  },
  promo_codes: {
    table: "promo_codes",
    schema: z.object({
      code: z.preprocess((v) => String(v ?? "").trim().toUpperCase(), z.string().regex(/^[A-Z0-9_-]{3,40}$/, "3–40 letters, numbers, - or _")),
      description: nullableText(200),
      discount_type: z.enum(["percent", "fixed"]),
      discount_value: z.coerce.number().positive(),
      min_subtotal_cents: money,
      max_discount_cents: nullableMoney,
      starts_at: z.preprocess((v) => (v ? v : null), datetime.nullable()),
      expires_at: z.preprocess((v) => (v ? v : null), datetime.nullable()),
      usage_limit: nullableInt(1, 1_000_000),
      per_customer_limit: nullableInt(1, 1000),
      customer_id: z.preprocess((v) => (v ? v : null), z.uuid().nullable()),
      first_booking_only: bool,
      is_active: bool,
    }).transform((d) => ({ ...d, discount_value: d.discount_type === "percent" ? Math.min(100, Math.round(d.discount_value)) : Math.round(d.discount_value * 100) })) as unknown as z.ZodType<Record<string, unknown>>,
  },
  testimonials: {
    table: "testimonials",
    tag: TAGS.content,
    paths: ["/"],
    schema: z.object({
      author_name: text(80).pipe(z.string().min(2)),
      author_title: nullableText(80),
      company: nullableText(120),
      quote: text(1000).pipe(z.string().min(10)),
      rating: nullableInt(1, 5),
      avatar_url: url,
      is_featured: bool,
      is_published: bool,
      is_sample: bool,
      sort_order: int(0, 10000),
    }) as unknown as z.ZodType<Record<string, unknown>>,
  },
  portfolio_projects: {
    table: "portfolio_projects",
    tag: TAGS.content,
    paths: ["/", "/work", "/services"],
    strip: ["media_urls"],
    schema: z.object({
      title: text(120).pipe(z.string().min(2)),
      slug,
      neighborhood: nullableText(120),
      city: nullableText(80),
      state: nullableText(2),
      property_type: nullableText(80),
      categories: lowerList,
      description: nullableText(3000),
      services_performed: list,
      cover_image_url: url,
      video_url: url,
      tour_url: url,
      hover_video_url: url,
      client_name: nullableText(120),
      industry: nullableText(80),
      year: nullableInt(2000, 2100),
      headline: nullableText(200),
      summary: nullableText(800),
      metrics: list.transform((lines) =>
        lines
          .map((l) => l.split("|").map((x) => x.trim()))
          .filter(([value, label]) => value && label)
          .map(([value, label]) => ({ value, label }))
          .slice(0, 6)
      ),
      challenge: nullableText(2000),
      strategy: nullableText(2000),
      execution: nullableText(2000),
      results: nullableText(2000),
      testimonial_quote: nullableText(800),
      testimonial_author: nullableText(120),
      testimonial_role: nullableText(120),
      is_featured: bool,
      is_published: bool,
      is_sample: bool,
      sort_order: int(0, 10000),
      media_urls: list,
    }) as unknown as z.ZodType<Record<string, unknown>>,
    relations: async (db, id, data) => {
      const urls = data.media_urls as string[];
      await db.from("portfolio_media").delete().eq("project_id", id);
      if (urls.length) {
        await db.from("portfolio_media").insert(
          urls.map((u, i) => {
            const [rawUrl, kind] = u.split("|").map((s) => s.trim());
            return { project_id: id, url: rawUrl, kind: kind === "drone" || kind === "video" ? kind : "photo", sort_order: i };
          })
        );
      }
    },
  },
  clients: {
    table: "clients",
    tag: TAGS.content,
    paths: ["/"],
    schema: z.object({
      name: text(120).pipe(z.string().min(2)),
      logo_url: url,
      website_url: url,
      sort_order: int(0, 10000),
      is_published: bool,
      is_sample: bool,
    }) as unknown as z.ZodType<Record<string, unknown>>,
  },
  service_areas: {
    table: "service_areas",
    tag: TAGS.settings,
    schema: z.object({
      name: text(80).pipe(z.string().min(2)),
      market: nullableText(80),
      kind: z.enum(["primary", "additional", "travel_zone"]),
      state: nullableText(2),
      cities: lowerList,
      postal_codes: list,
      center_latitude: nullableNumber,
      center_longitude: nullableNumber,
      radius_miles: nullableNumber,
      travel_fee_cents: money,
      per_mile_cents: money,
      free_miles: z.coerce.number().min(0).max(1000),
      priority: int(0, 10000),
      is_active: bool,
      notes: nullableText(500),
    }) as unknown as z.ZodType<Record<string, unknown>>,
  },
  photographers: {
    table: "photographers",
    schema: z.object({
      name: text(80).pipe(z.string().min(2)),
      email: z.preprocess((v) => (v ? v : null), z.email().nullable()),
      phone: nullableText(30),
      color: z.preprocess((v) => v || "#ff5b24", z.string().regex(/^#[0-9a-fA-F]{6}$/)),
      bio: nullableText(1000),
      skills: lowerList,
      max_shoots_per_day: nullableInt(1, 20),
      is_active: bool,
    }) as unknown as z.ZodType<Record<string, unknown>>,
  },
  schedule_blocks: {
    table: "schedule_blocks",
    schema: z
      .object({
        starts_at: datetime,
        ends_at: datetime,
        all_day: bool,
        reason: nullableText(200),
        photographer_id: z.preprocess((v) => (v ? v : null), z.uuid().nullable()),
      })
      .refine((d) => new Date(d.ends_at) > new Date(d.starts_at), { message: "End must be after start", path: ["ends_at"] }) as unknown as z.ZodType<Record<string, unknown>>,
  },
};

export async function saveResource(resource: string, id: string | null, values: Record<string, unknown>): Promise<ActionResult<{ id: string }>> {
  const def = RESOURCES[resource];
  if (!def) return { ok: false, error: "Unknown resource" };
  try {
    const { supabase } = await assertAdmin();
    const parsed = def.schema.safeParse(values);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: `${issue.path.join(".") || "Form"}: ${issue.message}`, fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
    }
    const data = parsed.data;
    const row = Object.fromEntries(Object.entries(data).filter(([k]) => !def.strip?.includes(k)));
    const query = id ? supabase.from(def.table).update(row).eq("id", id).select("id").single() : supabase.from(def.table).insert(row).select("id").single();
    const { data: saved, error } = await query;
    if (error) return { ok: false, error: error.code === "23505" ? "That slug/code is already in use." : error.message };
    if (def.relations) await def.relations(supabase, saved.id, data);
    if (def.tag) updateTag(def.tag);
    def.paths?.forEach((p) => revalidatePath(p));
    revalidatePath("/admin", "layout");
    return { ok: true, data: { id: saved.id } };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Save failed" };
  }
}

export async function deleteResource(resource: string, id: string): Promise<ActionResult> {
  const def = RESOURCES[resource];
  if (!def) return { ok: false, error: "Unknown resource" };
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from(def.table).delete().eq("id", id);
    if (error) {
      return { ok: false, error: error.code === "23503" ? "It's referenced by existing orders — deactivate it instead." : error.message };
    }
    if (def.tag) updateTag(def.tag);
    def.paths?.forEach((p) => revalidatePath(p));
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Delete failed" };
  }
}
