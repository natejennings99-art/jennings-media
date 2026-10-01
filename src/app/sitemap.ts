import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/data/public";
import { AGENCY_SERVICES, ARTICLES } from "@/lib/content/agency";
import { LOCATIONS } from "@/lib/content/seo";
import { env } from "@/lib/env";

export const revalidate = 3600;

const abs = (u: string) => (u.startsWith("http") ? u : `${env.siteUrl}${u}`);

/**
 * Image entries only for our own photography (/media/...). Third-party concept images
 * don't belong in the sitemap, and their query strings (&) aren't XML-escaped by Next,
 * which made the whole sitemap invalid.
 */
function ownImages(src: string | null | undefined) {
  return src && src.startsWith("/media/") ? { images: [abs(src)] } : {};
}

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
    ...AGENCY_SERVICES.map((s) => ({ url: `${env.siteUrl}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85, ...ownImages(s.image) })),
    ...LOCATIONS.map((l) => ({ url: `${env.siteUrl}/locations/${l.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((p) => ({
      url: `${env.siteUrl}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      ...ownImages(p.cover_image_url),
      ...(p.hover_video_url && p.cover_image_url
        ? { videos: [{ title: p.title, thumbnail_loc: abs(p.cover_image_url), description: p.summary ?? p.title, content_loc: abs(p.hover_video_url) }] }
        : {}),
    })),
    ...ARTICLES.map((a) => ({ url: `${env.siteUrl}/insights/${a.slug}`, lastModified: new Date(`${a.date}T12:00:00Z`), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
