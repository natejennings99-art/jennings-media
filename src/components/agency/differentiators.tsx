"use client";

import { useRef } from "react";
import { DIFFERENTIATORS } from "@/lib/content/agency";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { SplitReveal } from "@/components/experience/split-reveal";
import { SectionLabel } from "./section-label";
import { AmbientVideo } from "@/components/experience/ambient-video";

/** Enormous principles that "fill" with ink as they scroll through the viewport. */
export function Differentiators() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-fill]");
      if (prefersReducedMotion()) {
        rows.forEach((r) => r.style.setProperty("--fill", "100%"));
        return;
      }
      rows.forEach((row) => {
        gsap.fromTo(row, { "--fill": "0%" }, { "--fill": "100%", ease: "none", scrollTrigger: { trigger: row, start: "top 85%", end: "top 35%", scrub: true } });
      });
    },
    { scope: root }
  );
  return (
    <section ref={root} className="gutter relative isolate overflow-hidden py-24 sm:py-36" aria-labelledby="diff-title">
      <AmbientVideo src="/media/stock/ink.mp4" poster="/media/stock/ink.jpg" className="pointer-events-none absolute inset-0 -z-10 size-full object-cover opacity-30 mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950/40 to-ink-950" />
      <SectionLabel index="05" className="mb-8">Why us</SectionLabel>
      <SplitReveal as="h2" id="diff-title" className="font-display text-section text-bone-50">
        We don&rsquo;t do
        <br />
        <span className="text-accent-300">average.</span>
      </SplitReveal>
      <ol className="mt-16 sm:mt-24">
        {DIFFERENTIATORS.map((d, i) => (
          <li key={d.title} className="grid gap-4 border-t border-white/10 py-8 sm:py-12 lg:grid-cols-12 lg:items-end">
            <span className="label text-mist-500 lg:col-span-1">0{i + 1}</span>
            <p
              data-fill
              className="font-display text-[clamp(2.4rem,7.5vw,7.5rem)] [background-clip:text] text-transparent [-webkit-background-clip:text] lg:col-span-8"
              style={{ backgroundImage: "linear-gradient(90deg, #f7f4ee var(--fill, 100%), rgb(247 244 238 / 0.12) var(--fill, 100%))" }}
            >
              {d.title}
            </p>
            <p className="max-w-xs text-[16px] leading-relaxed text-mist-300 lg:col-span-3 lg:justify-self-end">{d.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
