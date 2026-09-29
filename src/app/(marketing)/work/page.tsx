import type { Metadata } from "next";
import { Suspense } from "react";
import { getPortfolio } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { WorkIndex } from "@/components/agency/work-index";
import { FinalCta } from "@/components/agency/final-cta";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Work: Brand Films, Ads & Content",
  description: "Case studies from Jennings Media: brand films, social campaigns, listing launches and event content for brands in DC, Virginia, Maryland and Tampa.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getPortfolio();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageIntro label="Work" title={<>Selected <span className="text-accent-300">work.</span></>}>
        Brands we&rsquo;ve built, launched and scaled — and the numbers that followed.
      </PageIntro>
      <Suspense>
        <WorkIndex projects={projects} />
      </Suspense>
      <div className="h-24 sm:h-40" />
      <FinalCta title="Want work like this?" kicker="Let's talk." />
    </>
  );
}
