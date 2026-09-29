import type { MetadataRoute } from "next";
import { getCatalog, getPortfolio } from "@/lib/data/public";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, projects] = await Promise.all([getCatalog(), getPortfolio()]);
  const now = new Date();
  const staticPages = ["", "/services", "/pricing", "/portfolio", "/about", "/contact", "/book", "/privacy", "/terms"].map((path) => ({
    url: `${env.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/book" || path === "/services" || path === "/pricing" ? 0.9 : 0.6,
  }));
  return [
    ...staticPages,
    ...catalog.services.map((s) => ({ url: `${env.siteUrl}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({ url: `${env.siteUrl}/portfolio/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
