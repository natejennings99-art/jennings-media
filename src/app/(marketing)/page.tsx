import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero, type HeroSlide } from "@/components/marketing/hero";
import { WordMarquee } from "@/components/marketing/marquee";
import { StatsBand } from "@/components/marketing/stats-band";
import { ServicesBento } from "@/components/marketing/services-bento";
import { BeforeAfter } from "@/components/marketing/before-after";
import { WhyUs } from "@/components/marketing/why-us";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { Testimonials } from "@/components/marketing/testimonials";
import { PackageCards } from "@/components/marketing/package-cards";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, faqSchema, localBusinessSchema } from "@/components/seo/json-ld";
import { getCatalog, getPortfolio, getServiceAreas, getSettings, getTestimonials } from "@/lib/data/public";
import { FAQS, MARQUEE_WORDS } from "@/lib/content/site";
import { IMAGES } from "@/lib/content/images";

export const revalidate = 300;

const SLIDES: HeroSlide[] = [
  { src: IMAGES.heroDusk, title: "Bayfront Modern", caption: "Twilight photography" },
  { src: IMAGES.heroVilla, title: "Palm Ridge Estate", caption: "Cinematic video & drone" },
  { src: IMAGES.heroInterior, title: "Gallery Residence", caption: "HDR interior photography" },
  { src: IMAGES.heroModern, title: "Lakeside Contemporary", caption: "Blue-hour exteriors" },
];

export default async function HomePage() {
  const [catalog, projects, testimonials, settings, areas] = await Promise.all([
    getCatalog(),
    getPortfolio(),
    getTestimonials(),
    getSettings(),
    getServiceAreas(),
  ]);
  const slides = settings.hero_image_url
    ? [{ src: settings.hero_image_url, title: settings.business_name, caption: "Featured listing" }, ...SLIDES.slice(1)]
    : SLIDES;

  return (
    <>
      <JsonLd data={[localBusinessSchema(settings, areas), faqSchema(FAQS)]} />
      <Hero slides={slides} videoUrl={settings.hero_video_url} />
      <WordMarquee words={MARQUEE_WORDS} />

      <section className="container-page pt-24 sm:pt-32">
        <StatsBand />
      </section>

      <section id="services" className="container-page scroll-mt-24 py-24 sm:py-32">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Services"
            title={
              <>
                Every visual a listing needs. <Accent>One</Accent> booking.
              </>
            }
            description="From next-morning photography to cinematic films and immersive 3D tours — order exactly what the property deserves."
          />
          <Link href="/services" className={buttonStyles({ variant: "outline", className: "self-start lg:self-auto" })}>
            All services
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <ServicesBento services={catalog.services} />
      </section>

      <section className="container-page py-12 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="The edit"
              title={
                <>
                  Hand-finished, <Accent>frame</Accent> by frame.
                </>
              }
              description="Drag the slider. Balanced windows, true-to-life color and straight verticals — every image, every time."
            />
          </div>
          <Reveal className="lg:col-span-8" variant="scale">
            <BeforeAfter src={IMAGES.livingBright} alt="Living room photographed and edited by Jennings Media" />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-24 sm:py-32">
        <WhyUs />
      </section>

      <section className="relative overflow-hidden border-y border-white/[0.06] bg-ink-900/40 py-24 sm:py-32">
        <div className="pointer-events-none absolute top-0 left-1/2 h-96 w-[70rem] -translate-x-1/2 rounded-full bg-gold-400/[0.05] blur-3xl" />
        <div className="container-page relative">
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title={
              <>
                Three steps. <Accent>Zero</Accent> hassle.
              </>
            }
            description="Built so you can book from the car between showings and wake up to finished media."
            className="mb-16 sm:mb-20"
          />
          <HowItWorks />
        </div>
      </section>

      {projects.length > 0 && (
        <section className="container-page py-24 sm:py-32">
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow="Portfolio"
              title={
                <>
                  Listings that <Accent>stop</Accent> the scroll.
                </>
              }
            />
            <Link href="/portfolio" className={buttonStyles({ variant: "outline", className: "self-start lg:self-auto" })}>
              Full portfolio
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
          <PortfolioGrid projects={projects} limit={9} />
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              align="center"
              eyebrow="Testimonials"
              title={
                <>
                  Agents <Accent>notice</Accent> the difference.
                </>
              }
              className="mb-14"
            />
          </div>
          <Testimonials items={testimonials} />
        </section>
      )}

      <section className="container-page py-24 sm:py-32">
        <SectionHeading
          align="center"
          eyebrow="Packages"
          title={
            <>
              Simple, <Accent>transparent</Accent> pricing.
            </>
          }
          description="Three packages that cover almost every listing, or build your own. Prices scale with home size."
          className="mb-14 sm:mb-20"
        />
        <PackageCards packages={catalog.packages} />
        <p className="mt-10 text-center text-sm text-mist-400">
          Need something custom?{" "}
          <Link href="/pricing" className="text-gold-200 underline-offset-4 hover:underline">
            See every service and add-on
          </Link>
        </p>
      </section>

      <section className="container-page grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title={<>Questions, <Accent>answered.</Accent></>} />
        </div>
        <div className="lg:col-span-8">
          <Faq items={FAQS} />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
