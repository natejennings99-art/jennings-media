import type { BusinessSettings, PortfolioProject } from "@/lib/types";
import type { AgencyService, Article } from "@/lib/content/agency";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";

/** Renders JSON-LD safely (escapes "<" so it can't break out of the script tag). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const ORG_ID = `${env.siteUrl}/#organization`;

export function organizationSchema(settings: BusinessSettings) {
  const sameAs = Object.values(settings.social_links).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: BRAND.name,
    description: BRAND.description,
    url: env.siteUrl,
    logo: `${env.siteUrl}/icon.svg`,
    image: `${env.siteUrl}/opengraph-image`,
    slogan: BRAND.tagline,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(settings.city ? { addressLocality: settings.city } : {}),
      ...(settings.state ? { addressRegion: settings.state } : {}),
      addressCountry: settings.country,
    },
    areaServed: "Worldwide",
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function agencyServicesSchema(services: AgencyService[]) {
  return services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    serviceType: s.title,
    description: s.body,
    url: `${env.siteUrl}/services#${s.slug}`,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
  }));
}

export function caseStudySchema(p: PortfolioProject) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${p.client_name ?? ""} — ${p.title}`.replace(/^ — /, ""),
    headline: p.headline ?? p.title,
    description: p.summary ?? p.description ?? undefined,
    image: p.cover_image_url ?? undefined,
    url: `${env.siteUrl}/work/${p.slug}`,
    creator: { "@id": ORG_ID },
    ...(p.year ? { dateCreated: String(p.year) } : {}),
  };
}

export function articleSchema(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    image: a.image,
    datePublished: a.date,
    dateModified: a.date,
    author: { "@type": "Organization", name: BRAND.name, url: env.siteUrl },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${env.siteUrl}/insights/${a.slug}`,
  };
}

export function faqSchema(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: `${env.siteUrl}${item.path}` })),
  };
}
