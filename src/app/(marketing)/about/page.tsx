import type { Metadata } from "next";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { getMarketing } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { Differentiators } from "@/components/agency/differentiators";
import { Results } from "@/components/agency/results";
import { FinalCta } from "@/components/agency/final-cta";
import { Parallax } from "@/components/experience/parallax";
import { SplitReveal } from "@/components/experience/split-reveal";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About — DC & Tampa Marketing Agency",
  description: `Founded in 2024 behind the camera, ${BRAND.name} is a marketing agency for brokerages, realtors and entrepreneurs in Washington, DC and Tampa — content, ads, AI and lead generation.`,
  alternates: { canonical: "/about" },
};

const DISCIPLINES = ["Lead generation", "Meta & Google Ads", "AI agents", "Social media", "Film & photography", "Websites & funnels", "Brand", "SEO"];

const WAYS = [
  { title: "Founder-led", body: "You work directly with the people planning, shooting and running your campaigns — no hand-offs to strangers." },
  { title: "Content and ads under one roof", body: "The team that films your content also builds your funnels and runs your ads, so creative and performance pull in the same direction." },
  { title: "Clear numbers", body: "Monthly reporting on leads, cost per lead and what we're changing next — in plain English." },
];

export default async function AboutPage() {
  const marketing = await getMarketing();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      <PageIntro
        label="About"
        title={
          <>
            Built behind
            <br />
            the <span className="text-accent-300">camera.</span>
          </>
        }
      >
        We started as a production studio, shooting for brands that needed to look as good as they were. Somewhere between the thousandth edit and the hundredth campaign report, we realized the best-looking work only matters when it moves the numbers.
      </PageIntro>

      <Parallax className="aspect-[4/5] w-full sm:aspect-[21/9]" amount={8}>
        <Image src="/media/video/groom.jpg" alt="Jennings Media on set for a Groom Guy brand film" fill priority sizes="100vw" className="object-cover" />
      </Parallax>

      <section className="gutter grid gap-12 py-24 sm:py-36 lg:grid-cols-12">
        <SectionLabel className="lg:col-span-3">Our mission</SectionLabel>
        <SplitReveal as="p" className="text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.12] font-medium tracking-[-0.035em] text-bone-50 lg:col-span-9">
          Today we&rsquo;re one team for the content, the campaigns and the systems behind them — in D.C. and Tampa — measured by the clients we win you.
        </SplitReveal>
      </section>

      <Differentiators />

      <section className="gutter py-24 sm:py-36">
        <SectionLabel className="mb-8">How we work</SectionLabel>
        <div className="grid gap-px overflow-hidden rounded-md bg-white/10 md:grid-cols-3">
          {WAYS.map((w, i) => (
            <div key={w.title} className="bg-ink-950 p-8 sm:p-10">
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-10 text-2xl font-semibold tracking-[-0.03em]">{w.title}</p>
              <p className="mt-3 text-[15.5px] leading-relaxed text-mist-400">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="gutter py-16 sm:py-24">
        <SectionLabel className="mb-8">Under one roof</SectionLabel>
        <ul className="flex flex-wrap gap-x-8 gap-y-2">
          {DISCIPLINES.map((d, i) => (
            <li key={d} className="font-display text-[clamp(1.9rem,4.5vw,4rem)] text-bone-50/80">
              {d}
              {i < DISCIPLINES.length - 1 && <span className="ml-8 text-accent-300">/</span>}
            </li>
          ))}
        </ul>
      </section>

      <Results stats={marketing.stats} />
      <FinalCta title="Sound like your kind of team?" kicker="Let's meet." />
    </>
  );
}
