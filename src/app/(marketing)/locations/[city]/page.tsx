import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, MapPin } from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/content/agency";
import { LOCATIONS, findLocation } from "@/lib/content/seo";
import { getPortfolio } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { CaseCard } from "@/components/agency/case-card";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, localBusinessSchema } from "@/components/seo/json-ld";
import { RelatedReading } from "@/components/agency/related-reading";

export const revalidate = 300;

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[city]">): Promise<Metadata> {
  const l = findLocation((await params).city);
  if (!l) return {};
  return { title: l.seoTitle, description: l.description, alternates: { canonical: `/locations/${l.slug}` }, openGraph: { title: l.seoTitle, description: l.description, images: [{ url: "/opengraph-image" }] } };
}

export default async function LocationPage({ params }: PageProps<"/locations/[city]">) {
  const l = findLocation((await params).city);
  if (!l) notFound();
  const projects = await getPortfolio();
  const local = l.work.map((slug) => projects.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  const work = local.length ? local : projects.filter((p) => p.is_featured).slice(0, 2);

  return (
    <>
      <JsonLd data={[localBusinessSchema(l), breadcrumbSchema([{ name: "Home", path: "/" }, { name: l.city, path: `/locations/${l.slug}` }])]} />
      <PageIntro label={`Marketing agency · ${l.city}`} title={<>{l.headline}</>}>
        {l.intro}
      </PageIntro>

      <section className="gutter pb-16" aria-labelledby="areas-title">
        <h2 id="areas-title" className="mb-6">
          <SectionLabel>Where we work</SectionLabel>
        </h2>
        <ul className="flex flex-wrap gap-3">
          {l.areas.map((a) => (
            <li key={a} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[14px] text-mist-300">
              <MapPin className="size-3.5 text-accent-300" />
              {a}
            </li>
          ))}
        </ul>
      </section>

      <section className="gutter py-16 sm:py-24" aria-labelledby="loc-services-title">
        <h2 id="loc-services-title" className="mb-10 font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          What we do in {l.city.split(",")[0]}
        </h2>
        <div className="grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {AGENCY_SERVICES.map((s) => (
            <TransitionLink key={s.slug} href={`/services/${s.slug}`} className="group flex flex-col justify-between gap-8 bg-ink-950 p-7 transition-colors hover:bg-ink-900">
              <span className="font-mono text-xs text-accent-300">{s.number}</span>
              <span>
                <span className="flex items-start justify-between gap-3 text-[20px] font-semibold tracking-tight text-bone-50">
                  {s.title}
                  <ArrowUpRight className="size-4 shrink-0 text-mist-500 transition-transform duration-500 group-hover:rotate-45 group-hover:text-accent-300" />
                </span>
                <span className="mt-2 block text-[14.5px] leading-relaxed text-mist-400">{s.short}</span>
              </span>
            </TransitionLink>
          ))}
        </div>
      </section>

      {work.length > 0 && (
        <section className="py-16 sm:py-24" aria-labelledby="loc-work-title">
          <h2 id="loc-work-title" className="gutter mb-10">
            <SectionLabel>{local.length ? `Recent work around ${l.city.split(",")[0]}` : "Recent work"}</SectionLabel>
          </h2>
          <div className="gutter grid gap-10 md:grid-cols-2">
            {work.slice(0, 4).map((p) => (
              <CaseCard key={p.id} project={p} layout="grid" />
            ))}
          </div>
        </section>
      )}
      <RelatedReading slugs={l.region === "FL" ? ["tampa-listing-media-guide", "tampa-small-business-ads", "ai-lead-follow-up-tampa"] : ["the-first-three-seconds", "fewer-campaigns-more-systems"]} title={l.region === "FL" ? "Guides for Tampa Bay businesses" : "Further reading"} />
      <FinalCta />
    </>
  );
}
