import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/data/public";
import { ARTICLES } from "@/lib/content/agency";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPortfolio();
  const now = new Date();
  const top = new Set(["", "/work", "/services", "/contact"]);
  const staticPages = ["", "/work", "/services", "/about", "/insights", "/contact", "/pricing", "/book", "/privacy", "/terms"].map((path) => ({
    url: `${env.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : top.has(path) ? 0.9 : 0.6,
  }));
  return [
    ...staticPages,
    ...projects.map((p) => ({ url: `${env.siteUrl}/work/${p.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...ARTICLES.map((a) => ({ url: `${env.siteUrl}/insights/${a.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
