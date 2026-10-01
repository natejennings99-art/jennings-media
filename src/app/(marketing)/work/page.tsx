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

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Work: Brand Films, Ads & Content",
  description: "Case studies from Jennings Media: brand films, listing launches, event coverage and social content for brands in Tampa Bay and Washington, DC.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const [projects, params] = await Promise.all([getPortfolio(), searchParams]);
  const industry = typeof params.industry === "string" ? params.industry : null;
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
      <FinalCta title="Want work like this?" kicker="Let's talk." />
    </>
  );
}
