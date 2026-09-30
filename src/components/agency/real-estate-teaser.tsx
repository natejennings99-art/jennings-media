"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "./section-label";

const TILES = [
  { slug: "tunlaw-penthouse", title: "Tunlaw Rd NW Penthouse", place: "Washington, DC", offset: "lg:mt-0" },
  { slug: "murnane", title: "10009 Murnane St", place: "Listing film", offset: "lg:mt-16" },
  { slug: "cobble-pond", title: "8182 Cobble Pond Way", place: "Manassas, VA", offset: "lg:mt-6" },
];

/** Homepage door into the dedicated Real Estate page. */
export function RealEstateTeaser() {
  return (
    <section className="gutter overflow-x-clip py-24 sm:py-36" aria-labelledby="re-title">
      <div className="grid items-start gap-14 lg:grid-cols-12">
        <div className="lg:sticky lg:top-32 lg:col-span-5">
          <SectionLabel index="03" className="mb-8">Real estate</SectionLabel>
          <SplitReveal as="h2" id="re-title" className="font-display text-section text-bone-50">
            Where we
            <br />
            <span className="text-accent-300">started.</span>
          </SplitReveal>
          <p className="mt-8 max-w-md text-[16px] leading-relaxed text-mist-300">
            Listing photography, cinematic video, drone, 3D tours and floor plans for agents and brokerages across D.C., Northern Virginia, Maryland and Tampa Bay — with packages you can book online.
          </p>
          <TransitionLink
            href="/real-estate"
            data-cursor="cta"
            className="group mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-bone-50 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-accent-300"
          >
            Explore real estate
            <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-4" />
            </span>
          </TransitionLink>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:col-span-7 lg:grid-cols-3">
          {TILES.map((t, i) => (
            <TransitionLink
              key={t.slug}
              href="/real-estate#films"
              data-cursor="view"
              className={`group relative block aspect-[9/16] overflow-hidden rounded-xl bg-ink-900 ${t.offset} ${i === 2 ? "col-span-2 mx-auto w-1/2 lg:col-span-1 lg:w-full" : ""}`}
            >
              <Image src={`/media/video/${t.slug}.jpg`} alt={`${t.title} — ${t.place}`} fill sizes="(min-width:1024px) 22vw, 50vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.05]" />
              <AmbientVideo src={`/media/video/${t.slug}.mp4`} threshold={0.6} className="absolute inset-0 size-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="label text-accent-300">{t.place}</p>
                <p className="mt-1.5 text-[16px] leading-tight font-semibold tracking-tight text-bone-50">{t.title}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}
