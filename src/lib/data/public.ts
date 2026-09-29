import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, serverEnv } from "@/lib/env";
import {
  DEFAULT_ADD_ONS,
  DEFAULT_PACKAGES,
  DEFAULT_SERVICE_AREAS,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  SAMPLE_PORTFOLIO,
  SAMPLE_TESTIMONIALS,
} from "@/lib/content/defaults";
import type {
  AddOn,
  BusinessSettings,
  Catalog,
  Package,
  PortfolioProject,
  Service,
  ServiceArea,
  Testimonial,
} from "@/lib/types";

export const TAGS = { settings: "settings", catalog: "catalog", content: "content" } as const;
const REVALIDATE = 300;

/* ------------------------------------------------------------------ settings */

export function mergeSettings(row: Partial<BusinessSettings> | null | undefined): BusinessSettings {
  const d = DEFAULT_SETTINGS;
  if (!row) return d;
  const { ...rest } = row as Partial<BusinessSettings> & { id?: number; updated_at?: string };
  delete (rest as { id?: number }).id;
  delete (rest as { updated_at?: string }).updated_at;
  return {
    ...d,
    ...rest,
    payment_options: { ...d.payment_options, ...(row.payment_options ?? {}) },
    scheduling: {
      ...d.scheduling,
      ...(row.scheduling ?? {}),
      working_hours: { ...d.scheduling.working_hours, ...(row.scheduling?.working_hours ?? {}) },
    },
    referral_program: { ...d.referral_program, ...(row.referral_program ?? {}) },
    notifications: { ...d.notifications, ...(row.notifications ?? {}) },
    analytics: { ...d.analytics, ...(row.analytics ?? {}) },
    social_links: { ...d.social_links, ...(row.social_links ?? {}) },
    service_area_policy: { ...d.service_area_policy, ...(row.service_area_policy ?? {}) },
  };
}

async function loadSettings(): Promise<BusinessSettings> {
  if (!features.supabaseAdmin) return DEFAULT_SETTINGS;
  const { data, error } = await createAdminClient().from("business_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[settings] falling back to defaults:", error.message);
    return DEFAULT_SETTINGS;
  }
  return mergeSettings(data as Partial<BusinessSettings> | null);
}

export const getSettings = unstable_cache(loadSettings, ["business-settings"], {
  tags: [TAGS.settings],
  revalidate: REVALIDATE,
});

/* ------------------------------------------------------------------- catalog */

type PackageRow = Omit<Package, "services"> & { package_services: { service_id: string; quantity: number }[] | null };
type AddOnRow = Omit<AddOn, "trigger_service_ids"> & { add_on_triggers: { service_id: string }[] | null };

export function defaultCatalog(): Catalog {
  return { services: DEFAULT_SERVICES, packages: DEFAULT_PACKAGES, addOns: DEFAULT_ADD_ONS };
}

/** Loads the active catalog. Throws when the database can't be read. */
export async function fetchCatalog(): Promise<Catalog> {
  const db = createPublicClient();
  const [services, packages, addOns] = await Promise.all([
    db.from("services").select("*").eq("is_active", true).order("sort_order"),
    db.from("packages").select("*, package_services(service_id, quantity)").eq("is_active", true).order("sort_order"),
    db.from("add_ons").select("*, add_on_triggers(service_id)").eq("is_active", true).order("sort_order"),
  ]);
  const error = services.error ?? packages.error ?? addOns.error;
  if (error) throw new Error(`Catalog query failed: ${error.message}`);
  return {
    services: (services.data ?? []) as Service[],
    packages: ((packages.data ?? []) as PackageRow[]).map(({ package_services, ...p }) => ({
      ...p,
      services: package_services ?? [],
    })),
    addOns: ((addOns.data ?? []) as AddOnRow[]).map(({ add_on_triggers, ...a }) => ({
      ...a,
      trigger_service_ids: (add_on_triggers ?? []).map((t) => t.service_id),
    })),
  };
}

async function loadCatalogWithFallback(): Promise<Catalog> {
  if (!features.supabase) return defaultCatalog();
  try {
    const catalog = await fetchCatalog();
    return catalog.services.length ? catalog : defaultCatalog();
  } catch (error) {
    console.error("[catalog] falling back to defaults:", error instanceof Error ? error.message : error);
    return defaultCatalog();
  }
}

/** Cached catalog for marketing pages and the booking UI. */
export const getCatalog = unstable_cache(loadCatalogWithFallback, ["catalog"], {
  tags: [TAGS.catalog],
  revalidate: REVALIDATE,
});

/** Uncached, no fallback — for pricing a real booking. */
export async function getCatalogStrict(): Promise<Catalog> {
  if (!features.supabase) throw new Error("Supabase is not configured.");
  return fetchCatalog();
}

export async function getServiceBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.services.find((s) => s.slug === slug) ?? null;
}

/* ------------------------------------------------------------- service areas */

async function loadServiceAreas(): Promise<ServiceArea[]> {
  if (!features.supabase) return DEFAULT_SERVICE_AREAS;
  const { data, error } = await createPublicClient()
    .from("service_areas")
    .select("*")
    .eq("is_active", true)
    .order("priority");
  if (error) {
    console.error("[service_areas]", error.message);
    return DEFAULT_SERVICE_AREAS;
  }
  return (data ?? []) as ServiceArea[];
}

export const getServiceAreas = unstable_cache(loadServiceAreas, ["service-areas"], {
  tags: [TAGS.settings],
  revalidate: REVALIDATE,
});

/* ------------------------------------------------------------------ content */

type ProjectRow = Omit<PortfolioProject, "media"> & { portfolio_media: PortfolioProject["media"] | null };

function visible<T extends { is_sample: boolean }>(items: T[]) {
  return serverEnv.showSampleContent ? items : items.filter((i) => !i.is_sample);
}

async function loadPortfolio(): Promise<PortfolioProject[]> {
  if (!features.supabase) return visible(SAMPLE_PORTFOLIO);
  const { data, error } = await createPublicClient()
    .from("portfolio_projects")
    .select("*, portfolio_media(*)")
    .eq("is_published", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "portfolio_media" });
  if (error) {
    console.error("[portfolio]", error.message);
    return visible(SAMPLE_PORTFOLIO);
  }
  return visible(
    ((data ?? []) as ProjectRow[]).map(({ portfolio_media, ...p }) => ({ ...p, media: portfolio_media ?? [] }))
  );
}

export const getPortfolio = unstable_cache(loadPortfolio, ["portfolio"], {
  tags: [TAGS.content],
  revalidate: REVALIDATE,
});

export async function getPortfolioProject(slug: string) {
  return (await getPortfolio()).find((p) => p.slug === slug) ?? null;
}

async function loadTestimonials(): Promise<Testimonial[]> {
  if (!features.supabase) return visible(SAMPLE_TESTIMONIALS);
  const { data, error } = await createPublicClient()
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) {
    console.error("[testimonials]", error.message);
    return visible(SAMPLE_TESTIMONIALS);
  }
  return visible((data ?? []) as Testimonial[]);
}

export const getTestimonials = unstable_cache(loadTestimonials, ["testimonials"], {
  tags: [TAGS.content],
  revalidate: REVALIDATE,
});
