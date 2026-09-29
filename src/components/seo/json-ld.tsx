import type { BusinessSettings, Service, ServiceArea } from "@/lib/types";
import { env } from "@/lib/env";
import { startingPrice } from "@/lib/pricing/engine";

/** Renders JSON-LD safely (escapes "<" to avoid breaking out of the script tag). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function localBusinessSchema(settings: BusinessSettings, areas: ServiceArea[]) {
  const areaNames = [...new Set(areas.flatMap((a) => (a.cities.length ? a.cities.slice(0, 8) : [a.name])))];
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${env.siteUrl}/#business`,
    name: settings.business_name,
    description: "Professional real estate photography, cinematic video, drone, floor plans, 3D tours and property marketing.",
    url: env.siteUrl,
    image: `${env.siteUrl}/opengraph-image`,
    logo: `${env.siteUrl}/icon.svg`,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...(settings.address_line1 ? { streetAddress: settings.address_line1 } : {}),
      ...(settings.city ? { addressLocality: settings.city } : {}),
      ...(settings.state ? { addressRegion: settings.state } : {}),
      ...(settings.postal_code ? { postalCode: settings.postal_code } : {}),
      addressCountry: settings.country,
    },
    ...(settings.latitude && settings.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: settings.latitude, longitude: settings.longitude } }
      : {}),
    areaServed: areaNames.map((name) => ({ "@type": "City", name: name.replace(/\b\w/g, (c) => c.toUpperCase()) })),
    sameAs: Object.values(settings.social_links).filter(Boolean),
  };
}

export function serviceSchema(service: Service, settings: BusinessSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.description ?? service.tagline ?? undefined,
    url: `${env.siteUrl}/services/${service.slug}`,
    provider: { "@id": `${env.siteUrl}/#business`, "@type": "ProfessionalService", name: settings.business_name },
    ...(service.image_url ? { image: service.image_url } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: settings.currency.toUpperCase(),
      price: (startingPrice(service) / 100).toFixed(2),
      url: `${env.siteUrl}/book`,
    },
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
