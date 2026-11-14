import type { Metadata } from "next";
import { getPortfolio } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { WorkIndex } from "@/components/agency/work-index";
import { PhotoGallery } from "@/components/agency/photo-gallery";
import { SectionLabel } from "@/components/agency/section-label";
import { SplitReveal } from "@/components/experience/split-reveal";
import { BRAND_PHOTOS } from "@/lib/content/photos";
import { FinalCta } from "@/components/agency/final-cta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import Image from "next/image";
import { INDUSTRY_PAGES } from "@/lib/content/industries";
import { showPlaceholders } from "@/lib/content/offers";
import { ProjectSlot } from "@/components/agency/project-slot";
import { TransitionLink } from "@/components/experience/transition";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Work: Brand Films, Ads & Content",
  description: "Case studies from Jennings Media: brand films, listing launches, event coverage and social content for brands in Tampa Bay and Washington, DC.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const [projects, params] = await Promise.all([getPortfolio(), searchParams]);
  const industry = typeof params.industry === "string" ? params.industry : null;
  const placeholders = showPlaceholders();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageIntro label="Work" title={<>Selected <span className="text-accent-300">work.</span></>}>
        Brand films, listing launches, client events and social content — shot, edited and launched by our team.
      </PageIntro>
      <WorkIndex projects={projects} industry={industry} />
      <section className="gutter py-24 sm:py-36" aria-labelledby="brand-photo-title">
        <SectionLabel className="mb-8">Brand photography</SectionLabel>
        <SplitReveal as="h2" id="brand-photo-title" className="mb-14 font-display text-section text-bone-50">
          People, product,
          <br />
          <span className="text-accent-300">place.</span>
        </SplitReveal>
        <PhotoGallery photos={BRAND_PHOTOS} />
      </section>
      <section className="gutter pb-24 sm:pb-36" aria-labelledby="by-industry-title">
        <SectionLabel className="mb-8">By industry</SectionLabel>
        <h2 id="by-industry-title" className="mb-10 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
          Find a shoot like yours.
        </h2>
        <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRY_PAGES.filter((i) => i.examples.length > 0 || placeholders).map((i) => {
            const e = i.examples[0];
            return (
              <li key={i.slug}>
                {e ? (
                  <TransitionLink href={`/industries/${i.slug}`} className="group block" aria-label={`${i.name}: see what you get`}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-900">
                      <Image src={e.src} alt={e.alt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </div>
                  </TransitionLink>
                ) : (
                  <ProjectSlot hint={`No shoot for ${i.name.toLowerCase()} yet. Add a real one in src/lib/content/industries.ts.`} />
                )}
                <p className="mt-4 text-[18px] font-semibold tracking-tight text-bone-50">
                  <TransitionLink href={`/industries/${i.slug}`} className="hover:text-accent-300">
                    {i.name}
                  </TransitionLink>
                </p>
                {e && <p className="mt-1 text-[14px] leading-snug text-mist-400">{e.caption}</p>}
              </li>
            );
          })}
          {placeholders && (
            <li>
              <ProjectSlot hint="Next project goes here. Add it in Admin → Work, or in src/lib/content/work.ts." />
            </li>
          )}
        </ul>
      </section>
      <FinalCta title="Want work like this?" kicker="Let's talk." />
    </>
  );
}
