import { getClients, getMarketing, getPortfolio, getSettings, getTestimonials } from "@/lib/data/public";
import { AGENCY_SERVICES } from "@/lib/content/agency";
import { FRAMES, REEL_CLIPS, REELS } from "@/lib/content/work";
import { FramesGallery } from "@/components/agency/frames-gallery";
import { ReelsWall } from "@/components/agency/reels-wall";
import { Hero } from "@/components/agency/hero";
import { LogoMarquee } from "@/components/agency/logo-marquee";
import { Showreel } from "@/components/agency/showreel";
import { FeaturedWork } from "@/components/agency/featured-work";
import { Results } from "@/components/agency/results";
import { ServicesList } from "@/components/agency/services-list";
import { Differentiators } from "@/components/agency/differentiators";
import { ProcessTimeline } from "@/components/agency/process-timeline";
import { Experiment } from "@/components/agency/experiment";
import { TestimonialsSlider } from "@/components/agency/testimonials-slider";
import { Industries } from "@/components/agency/industries";
import { FinalCta } from "@/components/agency/final-cta";
import { SectionLabel } from "@/components/agency/section-label";
import { SplitReveal } from "@/components/experience/split-reveal";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export default async function HomePage() {
  const [projects, testimonials, clients, marketing, settings] = await Promise.all([getPortfolio(), getTestimonials(), getClients(), getMarketing(), getSettings()]);
  const featured = [...projects].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
  const showreel = process.env.NEXT_PUBLIC_SHOWREEL_URL || marketing.showreel_url || null;

  return (
    <>
      <JsonLd data={organizationSchema(settings)} />
      <Hero videoUrl={settings.hero_video_url} trustLine={marketing.trust_line} clients={clients.map((c) => c.name)} />
      <LogoMarquee clients={clients} />
      <Showreel videoUrl={showreel} clips={REEL_CLIPS} />
      <FeaturedWork projects={featured} />
      <ReelsWall reels={REELS} />
      <FramesGallery frames={FRAMES} />
      <Results stats={marketing.stats} />
      <section className="py-24 sm:py-36" aria-labelledby="services-title">
        <div className="gutter mb-14 grid gap-8 sm:mb-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionLabel index="04" className="mb-8">Capabilities</SectionLabel>
            <SplitReveal as="h2" id="services-title" className="font-display text-section text-bone-50">
              Strategy. Creative.
              <br />
              <span className="text-accent-300">Growth.</span>
            </SplitReveal>
          </div>
          <p className="max-w-sm text-[16px] leading-relaxed text-mist-400 lg:col-span-4">
            Eight disciplines, one team, one plan. Hire us for one — or let them work together the way they should.
          </p>
        </div>
        <ServicesList services={AGENCY_SERVICES} />
      </section>
      <Differentiators />
      <ProcessTimeline />
      <Experiment />
      <TestimonialsSlider items={testimonials} />
      <Industries />
      <FinalCta />
    </>
  );
}
