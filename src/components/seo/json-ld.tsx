import type { BusinessSettings, PortfolioProject } from "@/lib/types";
import type { AgencyService, Article } from "@/lib/content/agency";
import type { Plan } from "@/lib/content/plans";
import type { Location } from "@/lib/content/seo";
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
    logo: `${env.siteUrl}${BRAND.emblem}`,
    foundingDate: String(BRAND.foundedYear),
    knowsAbout: ["Lead generation", "Meta Ads", "Google Ads", "AI agents", "Social media marketing", "Video production", "Photography", "Real estate marketing", "Web design", "SEO"],
    image: `${env.siteUrl}/opengraph-image`,
    slogan: BRAND.tagline,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    address: { "@type": "PostalAddress", addressLocality: "Washington", addressRegion: "DC", addressCountry: "US" },
    location: [
      { "@type": "Place", name: "Washington, DC", address: { "@type": "PostalAddress", addressLocality: "Washington", addressRegion: "DC", addressCountry: "US" } },
      { "@type": "Place", name: "Tampa, FL", address: { "@type": "PostalAddress", addressLocality: "Tampa", addressRegion: "FL", addressCountry: "US" } },
    ],
    areaServed: AREAS.map((name) => ({ "@type": "Place", name })),
    sameAs: [...new Set([BRAND.instagram, ...sameAs])],
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

const AREAS = ["Washington, DC", "Northern Virginia", "Maryland", "Tampa Bay, FL"];
const abs = (u: string) => (u.startsWith("http") ? u : `${env.siteUrl}${u}`);

export function serviceSchema(s: AgencyService, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${path}#service`,
    name: s.title,
    serviceType: s.title,
    description,
    url: `${env.siteUrl}${path}`,
    image: abs(s.image),
    provider: { "@id": ORG_ID },
    areaServed: AREAS.map((name) => ({ "@type": "Place", name })),
    offers: { "@type": "Offer", url: `${env.siteUrl}/plans`, priceCurrency: "USD" },
  };
}

export function videoSchema(p: PortfolioProject) {
  const src = p.hover_video_url ?? p.video_url;
  if (!src || !p.cover_image_url) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${p.title} — ${BRAND.name}`,
    description: p.summary ?? p.title,
    thumbnailUrl: [abs(p.cover_image_url)],
    uploadDate: `${p.year ?? BRAND.foundedYear}-06-01`,
    contentUrl: abs(src),
    publisher: { "@id": ORG_ID },
  };
}

export function offerCatalogSchema(plans: Plan[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: `${BRAND.name} retainers & packages`,
    url: `${env.siteUrl}/plans`,
    itemListElement: plans.map((p) => ({
      "@type": "Offer",
      name: p.name,
      description: p.tagline,
      price: p.price,
      priceCurrency: "USD",
      url: `${env.siteUrl}/plans`,
      seller: { "@id": ORG_ID },
      ...(p.interval ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "USD", unitCode: "MON", billingDuration: "P1M" } } : {}),
    })),
  };
}

export function localBusinessSchema(l: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${env.siteUrl}/locations/${l.slug}#business`,
    name: `${BRAND.name} — ${l.city}`,
    description: l.description,
    url: `${env.siteUrl}/locations/${l.slug}`,
    image: abs(BRAND.emblem),
    parentOrganization: { "@id": ORG_ID },
    ...(BRAND.email ? { email: BRAND.email } : {}),
    address: { "@type": "PostalAddress", addressLocality: l.locality, addressRegion: l.region, addressCountry: "US" },
    areaServed: l.areas.map((name) => ({ "@type": "City", name })),
    sameAs: [BRAND.instagram],
  };
}
