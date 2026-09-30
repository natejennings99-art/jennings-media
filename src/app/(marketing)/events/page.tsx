import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { EVENT_OFFERS, LIVE_REELS, SPORTS_REELS, SPORTS_WIDE, TRAVEL_REELS } from "@/lib/content/events";
import { BRAND } from "@/lib/brand";
import { FilmGrid, ReelRail } from "@/components/agency/film-wall";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Event, Sports & Concert Video in DC, VA & MD",
  description: "Event coverage, sports highlights, concert and nightlife reels, and hotel and resort content shot in 4K and cut for social media, by Jennings Media in Washington, DC.",
  alternates: { canonical: "/events" },
  openGraph: { images: [{ url: "/media/video/stadium.jpg" }] },
};

export default function EventsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Events & sports", path: "/events" }])} />

      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden" aria-label="Events and sports">
        <div className="absolute inset-0 -z-10 bg-ink-950">
          <video className="absolute inset-0 size-full object-cover opacity-75" src="/media/video/stadium.mp4" poster="/media/video/stadium.jpg" autoPlay muted loop playsInline />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/5 to-ink-950" />
        </div>
        <div className="gutter pt-40 pb-12 sm:pb-16">
          <p className="label mb-8 animate-fade-in text-accent-300">Events · Sports · Live · Travel</p>
          <SplitReveal as="h1" immediate className="font-display text-hero text-bone-50">
            The moments
            <br />
            <span className="text-accent-300">people share.</span>
          </SplitReveal>
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
            <p className="max-w-lg animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:700ms] lg:col-span-6">
              Ball games, concerts, polo matches, rooftop nights and resort escapes — filmed on cinema cameras and phones, and cut into reels built to travel.
            </p>
            <div className="flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:850ms] lg:col-span-6 lg:justify-end">
              <TransitionLink
                href="/contact"
                data-cursor="cta"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
              >
                Film your event
                <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <section className="gutter py-24 sm:py-36" aria-labelledby="sports-title">
        <SectionLabel index="01" className="mb-8">Sports</SectionLabel>
        <SplitReveal as="h2" id="sports-title" className="font-display text-section text-bone-50">
          Game day,
          <br />
          <span className="text-accent-300">up close.</span>
        </SplitReveal>
        <div className="mt-14">
          <FilmGrid films={SPORTS_WIDE} />
        </div>
        <h3 className="label mt-20 mb-8 text-mist-400">Basketball · Football · Polo</h3>
        <ReelRail films={SPORTS_REELS} />
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="live-title">
        <SectionLabel index="02" className="mb-8">Concerts & nightlife</SectionLabel>
        <SplitReveal as="h2" id="live-title" className="font-display text-section text-bone-50">
          Turn it
          <br />
          <span className="text-accent-300">up.</span>
        </SplitReveal>
        <div className="mt-14">
          <ReelRail films={LIVE_REELS} />
        </div>
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="travel-title">
        <SectionLabel index="03" className="mb-8">Hotels & resorts</SectionLabel>
        <SplitReveal as="h2" id="travel-title" className="font-display text-section text-bone-50">
          Places worth
          <br />
          <span className="text-accent-300">the trip.</span>
        </SplitReveal>
        <div className="mt-14">
          <ReelRail films={TRAVEL_REELS} />
        </div>
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="offer-title">
        <SectionLabel index="04" className="mb-8">What we make</SectionLabel>
        <h2 id="offer-title" className="sr-only">
          What we make for events
        </h2>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {EVENT_OFFERS.map((o, i) => (
            <div key={o.title} className="bg-ink-950 p-7 sm:p-8">
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <h3 className="mt-10 text-[22px] font-semibold tracking-tight text-bone-50">{o.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{o.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-[15px] text-mist-400">
          Planning a listing shoot instead?{" "}
          <TransitionLink href="/real-estate" className="text-bone-100 underline underline-offset-4 hover:text-accent-300">
            See real estate media
          </TransitionLink>
          . More on{" "}
          <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-bone-100 underline underline-offset-4 hover:text-accent-300">
            {BRAND.instagramHandle}
          </a>
          .
        </p>
      </section>

      <FinalCta title="Got an event coming up?" kicker="Let's film it." />
    </>
  );
}
