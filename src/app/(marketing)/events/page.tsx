import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { EVENT_FILMS, EVENT_OFFERS, EVENT_REELS } from "@/lib/content/events";
import { DC_PHOTOS, EPG_PHOTOS, SILOS_PHOTOS } from "@/lib/content/photos";
import { BRAND } from "@/lib/brand";
import { FilmGrid, ReelRail } from "@/components/agency/film-wall";
import { PhotoGallery } from "@/components/agency/photo-gallery";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Event Photography & Video in Tampa, FL",
  description: "Event photography and 4K video in Tampa Bay and Washington, DC: client appreciation nights, team outings, polo and community events, with same-week recaps.",
  alternates: { canonical: "/events" },
  openGraph: { images: [{ url: "/media/photos/suite-sunset.jpg" }] },
};

function CaseHeader({ n, client, title, text, href }: { n: string; client: string; title: string; text: string; href: string }) {
  return (
    <div className="mb-10 grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <p className="label text-accent-300">
          {n} · {client}
        </p>
        <h3 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.75rem)] text-bone-50">{title}</h3>
      </div>
      <div className="lg:col-span-5">
        <p className="text-[16px] leading-relaxed text-mist-400">{text}</p>
        <TransitionLink href={href} className="group mt-5 inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.08em] text-bone-50 uppercase hover:text-accent-300">
          <span className="border-b border-current pb-1">View the project</span>
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
        </TransitionLink>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Events", path: "/events" }])} />

      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden" aria-label="Events">
        <div className="absolute inset-0 -z-10 bg-ink-950">
          <video className="absolute inset-0 size-full object-cover opacity-75" src="/media/video/stadium.mp4" poster="/media/video/stadium.jpg" autoPlay muted loop playsInline />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/5 to-ink-950" />
        </div>
        <div className="gutter pt-40 pb-12 sm:pb-16">
          <p className="label mb-8 animate-fade-in text-accent-300">Event photography · 4K video · Same-week recaps</p>
          <SplitReveal as="h1" immediate className="font-display text-hero text-bone-50">
            Events worth
            <br />
            <span className="text-accent-300">reliving.</span>
          </SplitReveal>
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
            <p className="max-w-lg animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:700ms] lg:col-span-6">
              Client appreciation nights, team outings, polo matches and community events — photographed and filmed on cinema cameras, then cut into recaps your guests actually share.
            </p>
            <div className="flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:850ms] lg:col-span-6 lg:justify-end">
              <TransitionLink
                href="/contact"
                data-cursor="cta"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
              >
                Book event coverage
                <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </TransitionLink>
            </div>
          </div>
        </div>
      </section>

      <section className="gutter py-24 sm:py-36" aria-labelledby="films-title">
        <SectionLabel index="01" className="mb-8">Event films</SectionLabel>
        <SplitReveal as="h2" id="films-title" className="font-display text-section text-bone-50">
          The night,
          <br />
          <span className="text-accent-300">in motion.</span>
        </SplitReveal>
        <div className="mt-14">
          <FilmGrid films={EVENT_FILMS} />
        </div>
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="cases-title">
        <SectionLabel index="02" className="mb-8">Event photography</SectionLabel>
        <h2 id="cases-title" className="sr-only">
          Event photography
        </h2>
        <CaseHeader
          n="01"
          client="Elevate Property Group"
          title="A team night at the ballpark."
          text="Suite-level coverage of the brokerage's night at the game: the view, the people and a step-and-repeat wall, photographed and filmed from first pitch to sunset."
          href="/work/elevate-property-group"
        />
        <PhotoGallery photos={EPG_PHOTOS} />
        <div className="mt-24 sm:mt-32">
          <CaseHeader
            n="02"
            client="Right Fit Realty"
            title="Brewery night at 2 Silos."
            text="A client appreciation evening at the Yard: stage, taproom and beer garden, captured in stills and 4K video and cut into a one-minute recap."
            href="/work/right-fit-brewery-event"
          />
          <PhotoGallery photos={SILOS_PHOTOS} />
        </div>
      </section>

      <section className="pb-24 sm:pb-36" aria-labelledby="reels-title">
        <div className="gutter">
          <SectionLabel index="03" className="mb-8">Recaps & reels</SectionLabel>
          <SplitReveal as="h2" id="reels-title" className="mb-14 font-display text-section text-bone-50">
            Made to be
            <br />
            <span className="text-accent-300">shared.</span>
          </SplitReveal>
          <ReelRail films={EVENT_REELS} />
        </div>
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="dc-title">
        <SectionLabel index="04" className="mb-8">Around Washington, D.C.</SectionLabel>
        <div className="mb-14 grid gap-8 lg:grid-cols-12 lg:items-end">
          <SplitReveal as="h2" id="dc-title" className="font-display text-section text-bone-50 lg:col-span-8">
            The city
            <br />
            <span className="text-accent-300">we shoot.</span>
          </SplitReveal>
          <p className="max-w-sm text-[16px] leading-relaxed text-mist-400 lg:col-span-4">The Kite Festival on the National Mall and cherry blossom season at the Tidal Basin, shot by our team.</p>
        </div>
        <PhotoGallery photos={DC_PHOTOS} columns={2} />
      </section>

      <section className="gutter pb-24 sm:pb-36" aria-labelledby="offer-title">
        <SectionLabel index="05" className="mb-8">What you get</SectionLabel>
        <h2 id="offer-title" className="sr-only">
          What you get with event coverage
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
          Listing a property instead?{" "}
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

      <FinalCta title="Got an event coming up?" kicker="Let's cover it." />
    </>
  );
}
