import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/content/agency";
import { SERVICE_SEO } from "@/lib/content/seo";
import { findPlan, formatPlanPrice } from "@/lib/content/plans";
import { getPortfolio } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { CaseCard } from "@/components/agency/case-card";
import { ProcessTimeline } from "@/components/agency/process-timeline";
import { FinalCta } from "@/components/agency/final-cta";
import { ClipReveal } from "@/components/experience/parallax";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, faqSchema, serviceSchema } from "@/components/seo/json-ld";
import { RelatedReading } from "@/components/agency/related-reading";

export const revalidate = 300;

export function generateStaticParams() {
  return AGENCY_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = AGENCY_SERVICES.find((x) => x.slug === slug);
  const seo = SERVICE_SEO[slug];
  if (!s || !seo) return {};
  return {
    title: seo.seoTitle,
    description: seo.description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: { title: seo.seoTitle, description: seo.description, images: [{ url: s.image }] },
  };
}

/** Insights articles that go deeper on each service. */
const READING: Record<string, string[]> = {
  "lead-generation": ["tampa-small-business-ads", "ai-lead-follow-up-tampa", "fewer-campaigns-more-systems"],
  "paid-media": ["tampa-small-business-ads", "roas-is-a-lagging-indicator", "the-first-three-seconds"],
  "ai-automation": ["ai-lead-follow-up-tampa", "fewer-campaigns-more-systems"],
  "social-media": ["the-first-three-seconds", "tampa-listing-media-guide"],
  "content-production": ["tampa-listing-media-guide", "the-first-three-seconds"],
  "web-design": ["fewer-campaigns-more-systems", "ai-lead-follow-up-tampa"],
  "brand-strategy": ["the-first-three-seconds", "fewer-campaigns-more-systems"],
  "seo-content": ["tampa-listing-media-guide", "tampa-small-business-ads"],
};

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = AGENCY_SERVICES.find((x) => x.slug === slug);
  const seo = SERVICE_SEO[slug];
  if (!s || !seo) notFound();

  const projects = await getPortfolio();
  const related = [...projects.filter((p) => p.categories.some((c) => seo.categories.includes(c))), ...projects.filter((p) => p.is_featured)]
    .filter((p, i, all) => all.findIndex((x) => x.id === p.id) === i)
    .slice(0, 2);
  const offers = [findPlan(seo.plan), findPlan(seo.package)].filter((p) => p !== null);
  const path = `/services/${slug}`;

  return (
    <>
      <JsonLd data={[serviceSchema(s, seo.description, path), faqSchema(seo.faqs), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: s.title, path }])]} />
      <PageIntro
        label={`Service ${s.number}`}
        title={
          <>
            {s.title}
            <span className="text-accent-300">.</span>
          </>
        }
      >
        {s.short} {s.body}
      </PageIntro>

      <ClipReveal>
        <div className="relative aspect-[4/5] w-full sm:aspect-[21/9]">
          <Image src={s.image} alt={s.title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
        </div>
      </ClipReveal>

      <section className="gutter grid gap-12 py-20 sm:py-28 lg:grid-cols-12" aria-labelledby="deliverables-title">
        <div className="lg:col-span-5">
          <SectionLabel className="mb-6">What you get</SectionLabel>
          <h2 id="deliverables-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            {s.outcome}
          </h2>
        </div>
        <ul className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {s.deliverables.map((d) => (
            <li key={d} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.02] p-5 text-[16px] text-bone-100">
              <Check className="mt-1 size-4 shrink-0 text-accent-300" />
              {d}
            </li>
          ))}
        </ul>
      </section>

      {offers.length > 0 && (
        <section className="gutter pb-20" aria-labelledby="offers-title">
          <h2 id="offers-title" className="sr-only">
            Ways to start
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {offers.map((p) => (
              <TransitionLink key={p.slug} href="/plans" className="group flex items-end justify-between gap-6 rounded-lg border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-accent-300/60">
                <div>
                  <p className="label text-accent-300">{p.interval ? "Monthly retainer" : "Package"}</p>
                  <p className="mt-3 font-display text-[1.9rem] text-bone-50">{p.name}</p>
                  <p className="mt-2 text-[15px] text-mist-400">{p.tagline}</p>
                </div>
                <p className="shrink-0 text-right">
                  <span className="font-display text-[2rem] text-bone-50">{formatPlanPrice(p)}</span>
                  <span className="label block text-mist-500">{p.interval ? "/ month" : "one-time"}</span>
                </p>
              </TransitionLink>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-16 sm:py-24" aria-labelledby="related-title">
          <h2 id="related-title" className="gutter mb-10">
            <SectionLabel>Related work</SectionLabel>
          </h2>
          <div className="gutter grid gap-10 md:grid-cols-2">
            {related.map((p) => (
              <CaseCard key={p.id} project={p} layout="grid" />
            ))}
          </div>
        </section>
      )}

      <ProcessTimeline />

      <section className="gutter py-20 sm:py-28" aria-labelledby="faq-title">
        <h2 id="faq-title" className="mb-8">
          <SectionLabel>Questions</SectionLabel>
        </h2>
        <dl className="divide-y divide-white/10 border-y border-white/10">
          {seo.faqs.map((f) => (
            <div key={f.q} className="grid gap-3 py-7 lg:grid-cols-12">
              <dt className="text-[19px] font-semibold tracking-tight text-bone-50 lg:col-span-5">{f.q}</dt>
              <dd className="text-[16px] leading-relaxed text-mist-300 lg:col-span-6 lg:col-start-7">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="gutter pb-20" aria-label="More services">
        <SectionLabel className="mb-6">More services</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {AGENCY_SERVICES.filter((x) => x.slug !== slug).map((o) => (
            <TransitionLink key={o.slug} href={`/services/${o.slug}`} className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[14px] text-mist-300 transition-colors hover:border-accent-300 hover:text-bone-50">
              {o.title}
              <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
          ))}
        </div>
      </nav>
      <RelatedReading slugs={READING[s.slug] ?? []} />
      <FinalCta />
    </>
  );
}
