import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { AGENCY_SERVICES } from "@/lib/content/agency";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { ProcessTimeline } from "@/components/agency/process-timeline";
import { FinalCta } from "@/components/agency/final-cta";
import { ClipReveal } from "@/components/experience/parallax";
import { SplitReveal } from "@/components/experience/split-reveal";
import { JsonLd, agencyServicesSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { IMAGES } from "@/lib/content/images";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/experience/transition";

export const metadata: Metadata = {
  title: "Services: Lead Gen, Ads, AI & Content",
  description: "Lead generation, Meta & Google Ads, AI agents, social media, content production, websites, branding and SEO — one marketing team for your growth.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={[...agencyServicesSchema(AGENCY_SERVICES), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])]} />
      <PageIntro
        label="Services"
        title={
          <>
            Built to get
            <br />
            <span className="text-accent-300">attention.</span>
          </>
        }
        aside={
          <nav aria-label="Services" className="grid grid-cols-2 gap-x-10 gap-y-2">
            {AGENCY_SERVICES.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="group flex items-baseline gap-3 text-[15px] text-mist-300 hover:text-bone-50">
                <span className="font-mono text-xs text-accent-300">{s.number}</span>
                {s.title}
              </a>
            ))}
          </nav>
        }
      >
        Eight disciplines under one roof. Start with one, or let them work together — strategy, creative, media and technology pointed at the same number.
      </PageIntro>

      <div className="gutter space-y-4">
        {AGENCY_SERVICES.map((s, i) => (
          <section key={s.slug} id={s.slug} className="grid scroll-mt-28 gap-10 border-t border-white/10 py-16 sm:py-24 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <p className="font-mono text-sm text-accent-300">{s.number}</p>
                <h2 className="mt-3 font-display text-[clamp(2.5rem,5.5vw,5.5rem)] text-bone-50">{s.title}</h2>
                <p className="mt-6 max-w-md text-[17px] leading-relaxed text-mist-300">{s.short}</p>
                <TransitionLink href={`/services/${s.slug}`} className="group mt-6 inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
                  Explore {s.title}
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                </TransitionLink>
              </div>
            </div>
            <div className={cn("space-y-10 lg:col-span-6 lg:col-start-7", i % 2 === 1 && "lg:order-first lg:col-start-1")}>
              <ClipReveal>
                <div className="relative aspect-[16/10] overflow-hidden rounded-md">
                  <Image src={s.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                </div>
              </ClipReveal>
              <p className="text-[18px] leading-relaxed text-bone-100">{s.body}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-3 border-t border-white/10 pt-3 text-[15px] text-mist-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {d}
                  </li>
                ))}
              </ul>
              <p className="label text-mist-400">
                Outcome — <span className="text-bone-50">{s.outcome}</span>
              </p>
              {s.slug === "content-production" && (
                <div className="relative overflow-hidden rounded-md border border-white/10">
                  <div className="relative aspect-[21/9]">
                    <Image src={IMAGES.heroDusk} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="label text-accent-300">For agents & brokerages</p>
                    <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">Real estate media, booked online.</p>
                    <p className="mt-2 text-[15px] text-mist-400">Photography, cinematic video, drone, floor plans and 3D tours — instant pricing, online scheduling, next-morning delivery.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <TransitionLink href="/book" className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-300 px-5 text-[13px] font-semibold tracking-wide text-ink-950 uppercase">
                        Book a shoot <ArrowUpRight className="size-4" />
                      </TransitionLink>
                      <TransitionLink href="/pricing" className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-[13px] font-semibold tracking-wide uppercase">
                        Media pricing
                      </TransitionLink>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <section className="gutter py-16">
        <SectionLabel className="mb-6">Engagements</SectionLabel>
        <SplitReveal as="h2" className="max-w-[20ch] font-display text-[clamp(2.25rem,5vw,4.75rem)] text-bone-50">
          Projects, retainers or a single sprint — scoped to the outcome.
        </SplitReveal>
      </section>
      <ProcessTimeline />
      <FinalCta />
    </>
  );
}
