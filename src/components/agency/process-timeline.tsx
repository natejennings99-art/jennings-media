"use client";

import { useRef, useState } from "react";
import { PROCESS } from "@/lib/content/agency";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { SplitReveal } from "@/components/experience/split-reveal";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

/** Six-stage process: each stage activates as it crosses the viewport center, with a progress rail. */
export function ProcessTimeline() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
      steps.forEach((step, i) => {
        ScrollTrigger.create({ trigger: step, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setActive(i) });
      });
      if (!prefersReducedMotion()) {
        gsap.fromTo(rail.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 55%", end: "bottom 55%", scrub: true } });
      } else {
        gsap.set(rail.current, { scaleY: 1 });
      }
    },
    { scope: root }
  );

  return (
    <section ref={root} className="gutter py-24 sm:py-36" aria-labelledby="process-title">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionLabel index="06" className="mb-8">Process</SectionLabel>
            <SplitReveal as="h2" id="process-title" className="font-display text-section text-bone-50">
              From idea
              <br />
              to <span className="text-accent-300">impact.</span>
            </SplitReveal>
            <p className="mt-10 hidden font-display text-[8rem] leading-none text-bone-50/10 lg:block" aria-hidden>
              {PROCESS[active].number}
            </p>
          </div>
        </div>
        <ol ref={list} className="relative lg:col-span-6 lg:col-start-7">
          <div className="absolute top-0 bottom-0 left-[7px] w-px bg-white/10" aria-hidden />
          <div ref={rail} className="absolute top-0 bottom-0 left-[7px] w-px origin-top bg-accent-300" aria-hidden />
          {PROCESS.map((step, i) => (
            <li key={step.number} data-step className="relative pb-16 pl-12 last:pb-0 sm:pb-24">
              <span className={cn("absolute top-3 left-0 size-[15px] rounded-full border-2 transition-all duration-500", i <= active ? "border-accent-300 bg-accent-300" : "border-white/25 bg-ink-950")} aria-hidden />
              <p className={cn("font-mono text-sm transition-colors duration-500", i === active ? "text-accent-300" : "text-mist-500")}>{step.number}</p>
              <h3 className={cn("mt-2 font-display text-[clamp(2.25rem,5vw,4.5rem)] transition-colors duration-500", i === active ? "text-bone-50" : "text-bone-50/25")}>
                {step.title}
              </h3>
              <p className={cn("mt-4 max-w-md text-[16px] leading-relaxed transition-colors duration-500", i === active ? "text-mist-300" : "text-mist-600")}>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
