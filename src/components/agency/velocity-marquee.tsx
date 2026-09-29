"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Oversized type rows that drift in opposite directions and surge/lean with scroll velocity. */
export function VelocityMarquee({ rows }: { rows: string[][] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tracks = gsap.utils.toArray<HTMLElement>("[data-track]", root.current);
      const loops = tracks.map((t, i) => gsap.fromTo(t, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, duration: 42, ease: "none", repeat: -1 }));
      const setSkew = gsap.quickSetter(tracks, "skewX", "deg");
      let target = 0;
      let current = 0;
      const tick = () => {
        current += (target - current) * 0.12;
        target *= 0.9;
        setSkew(current);
      };
      gsap.ticker.add(tick);
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const dir = v < 0 ? -1 : 1;
          const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(v) / 350);
          loops.forEach((l) => gsap.to(l, { timeScale: boost * dir, duration: 0.25, overwrite: true, onComplete: () => void gsap.to(l, { timeScale: dir, duration: 1.4 }) }));
          target = gsap.utils.clamp(-9, 9, v / -260);
        },
      });
      return () => gsap.ticker.remove(tick);
    },
    { scope: root }
  );

  return (
    <section ref={root} aria-hidden className="overflow-hidden py-14 select-none sm:py-20">
      {rows.map((words, i) => (
        <div key={i} data-track className="flex w-max whitespace-nowrap will-change-transform">
          {[...words, ...words].map((w, j) => (
            <span key={j} className={cn("font-display text-[clamp(3.25rem,10vw,9.5rem)] leading-[1.02]", (j + i) % 2 ? "text-outline" : "text-bone-50")}>
              {w}
              <span className="mx-[0.35em] text-accent-300 [-webkit-text-stroke:0]">✦</span>
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}
