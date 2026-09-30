"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "./section-label";

const TILES = [
  { href: "/real-estate", slug: "great-falls", title: "Real Estate", text: "Photos, film, drone, 3D tours & floor plans. Packages from $250.", cta: "See packages" },
  { href: "/events", slug: "stadium", title: "Events & Sports", text: "Client events, polo and team nights, filmed and photographed.", cta: "See the events" },
  { href: "/work", slug: "groom", title: "Brands & Campaigns", text: "Films, social and content for brands that want to be seen.", cta: "See the work" },
] as const;

/** Big, obvious doors to the three main bodies of work — right under the hero. */
export function ExploreTiles() {
  return (
    <section className="gutter py-20 sm:py-28" aria-labelledby="explore-title">
      <SectionLabel index="00" className="mb-8">Start here</SectionLabel>
      <h2 id="explore-title" className="sr-only">
        Explore Jennings Media
      </h2>
      <div className="grid gap-4 md:grid-cols-3 md:gap-5">
        {TILES.map((t) => (
          <TransitionLink key={t.href} href={t.href} data-cursor="view" className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-ink-900 md:aspect-[3/4]">
            <Image src={`/media/video/${t.slug}.jpg`} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.05]" />
            <AmbientVideo src={`/media/video/${t.slug}.mp4`} threshold={0.4} className="absolute inset-0 size-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
              <h3 className="font-display text-[clamp(2.25rem,4.2vw,3.75rem)] text-bone-50">{t.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-mist-300">{t.text}</p>
              <span className="mt-6 inline-flex items-center gap-3 text-[13px] font-semibold tracking-[0.08em] text-accent-300 uppercase">
                {t.cta}
                <span className="grid size-9 place-items-center rounded-full bg-accent-300 text-ink-950 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </span>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}
