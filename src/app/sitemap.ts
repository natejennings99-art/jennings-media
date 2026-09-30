import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/data/public";
import { AGENCY_SERVICES, ARTICLES } from "@/lib/content/agency";
import { LOCATIONS } from "@/lib/content/seo";
import { env } from "@/lib/env";

export const revalidate = 3600;

const abs = (u: string) => (u.startsWith("http") ? u : `${env.siteUrl}${u}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPortfolio();
  const now = new Date();
  const top = new Set(["", "/work", "/real-estate", "/events", "/services", "/plans", "/contact"]);
  const staticPages = ["", "/work", "/real-estate", "/events", "/services", "/plans", "/about", "/insights", "/contact", "/pricing", "/book", "/privacy", "/terms"].map((path) => ({
    url: `${env.siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : top.has(path) ? 0.9 : 0.6,
  }));
  return [
    ...staticPages,
    ...AGENCY_SERVICES.map((s) => ({ url: `${env.siteUrl}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85, images: [abs(s.image)] })),
    ...LOCATIONS.map((l) => ({ url: `${env.siteUrl}/locations/${l.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({
      url: `${env.siteUrl}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...(p.cover_image_url ? { images: [abs(p.cover_image_url)] } : {}),
      ...(p.hover_video_url && p.cover_image_url
        ? { videos: [{ title: p.title, thumbnail_loc: abs(p.cover_image_url), description: p.summary ?? p.title, content_loc: abs(p.hover_video_url) }] }
        : {}),
    })),
    ...ARTICLES.map((a) => ({ url: `${env.siteUrl}/insights/${a.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
