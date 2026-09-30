import { BRAND } from "@/lib/brand";
import { AGENCY_SERVICES } from "@/lib/content/agency";
import { PACKAGES, RETAINERS } from "@/lib/content/plans";
import { LOCATIONS } from "@/lib/content/seo";
import { env } from "@/lib/env";

export const dynamic = "force-static";

/** Plain-language summary for AI assistants and answer engines (llmstxt.org). */
export function GET() {
  const u = env.siteUrl;
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> ${BRAND.description}`,
    "",
    `Locations: ${LOCATIONS.map((l) => l.city).join(" and ")}. Founded ${BRAND.foundedYear}. Instagram: ${BRAND.instagram}${BRAND.email ? ` · Email: ${BRAND.email}` : ""}`,
    "",
    "## Services",
    ...AGENCY_SERVICES.map((s) => `- [${s.title}](${u}/services/${s.slug}): ${s.short}`),
    "",
    "## Pricing",
    ...[...RETAINERS, ...PACKAGES].map((p) => `- ${p.name}: $${p.price.toLocaleString("en-US")}${p.interval ? "/month" : " one-time"} — ${p.tagline}`),
    "",
    "## Pages",
    `- [Work & case studies](${u}/work)`,
    `- [Event, sports & concert video](${u}/events)`,
    `- [Real estate photography, video & drone — packages and films](${u}/real-estate)`,
    `- [Pricing](${u}/plans)`,
    `- [Book a real estate shoot](${u}/book)`,
    `- [Contact](${u}/contact)`,
    ...LOCATIONS.map((l) => `- [${l.seoTitle}](${u}/locations/${l.slug})`),
  ];
  return new Response(lines.join("\n") + "\n", { headers: { "content-type": "text/plain; charset=utf-8" } });
}
