"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Frame } from "@/lib/content/work";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { SplitReveal } from "@/components/experience/split-reveal";
import { SectionLabel } from "./section-label";

/**
 * Our own frames on a pinned, scroll-scrubbed horizontal track (desktop), with
 * media drifting inside each frame for depth. Touch and reduced motion get a
 * native swipe row instead.
 */
export function FramesGallery({ frames }: { frames: Frame[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (pointer: fine)", () => {
        const el = track.current;
        if (!el) return;
        const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
        const range = { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.8, invalidateOnRefresh: true };
        gsap.to(el, { x: () => -distance(), ease: "none", scrollTrigger: { ...range, pin: true, anticipatePin: 1 } });
        gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: range });
        el.querySelectorAll<HTMLElement>("[data-drift]").forEach((m) => gsap.fromTo(m, { xPercent: 5 }, { xPercent: -5, ease: "none", scrollTrigger: range }));
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden py-24 md:flex md:h-svh md:flex-col md:justify-center md:py-0" aria-labelledby="frames-title">
      <div
        ref={track}
        className="flex w-full snap-x snap-mandatory scroll-px-[clamp(1.25rem,4vw,4rem)] items-end gap-5 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] pb-4 [scrollbar-width:none] md:w-max md:snap-none md:gap-10 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <div className="w-[82vw] shrink-0 snap-start self-center md:w-[30vw] md:pr-8">
          <SectionLabel className="mb-8">Field notes</SectionLabel>
          <SplitReveal as="h2" id="frames-title" className="font-display text-section text-bone-50">
            Shot
            <br />
            by <span className="text-accent-300">us.</span>
          </SplitReveal>
          <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-mist-400">
            Every frame on this strip came off our own cameras and drones — estates, brands and the people behind them.
          </p>
          <p className="label mt-8 hidden items-center gap-3 text-mist-500 md:flex">
            Keep scrolling <span className="h-px w-10 bg-mist-600" />
          </p>
        </div>
        {frames.map((f, i) => (
          <figure key={f.src} className={cn("shrink-0 snap-start", f.shape === "tall" ? "w-[66vw] md:w-[24vw]" : "w-[82vw] md:w-[44vw]")}>
            <div className={cn("relative overflow-hidden rounded-md bg-ink-900", f.shape === "tall" ? "aspect-[4/5]" : "aspect-[16/10]")}>
              <div data-drift className="absolute inset-y-0 -right-[7%] -left-[7%]">
                <Image src={f.src} alt={`${f.title} — ${f.kind}`} fill sizes="(min-width:768px) 48vw, 85vw" className="object-cover" />
                {f.video && <AmbientVideo src={f.video} threshold={0.35} className="absolute inset-0 size-full object-cover" />}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
            </div>
            <figcaption className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-[15px] font-semibold tracking-tight text-bone-50">{f.title}</span>
              <span className="label shrink-0 text-mist-500 tabular-nums">
                {String(i + 1).padStart(2, "0")} · {f.kind}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="gutter mt-12 hidden md:block" aria-hidden>
        <div className="h-px w-full bg-white/10">
          <div ref={bar} className="h-px origin-left scale-x-0 bg-accent-300" />
        </div>
      </div>
    </section>
  );
}
