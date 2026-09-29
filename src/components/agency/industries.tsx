"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { INDUSTRIES } from "@/lib/content/agency";
import { hasFinePointer } from "@/lib/motion";
import { TransitionLink } from "@/components/experience/transition";
import { SplitReveal } from "@/components/experience/split-reveal";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

/** Large typographic links; a preview image trails the cursor on hover. */
export function Industries() {
  const [active, setActive] = useState<number | null>(null);
  const float = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!hasFinePointer()) return;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;
      const tilt = Math.max(-8, Math.min(8, (target.x - pos.x) * 0.08));
      if (float.current) float.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className="gutter py-24 sm:py-36" aria-labelledby="industries-title">
      <SectionLabel index="09" className="mb-8">Industries</SectionLabel>
      <SplitReveal as="h2" className="font-display text-section text-bone-50">
        We work where
        <br />
        culture <span className="text-accent-300">moves.</span>
      </SplitReveal>
      <ul ref={list} className="mt-16 border-t border-white/10 sm:mt-24" onPointerLeave={() => setActive(null)}>
        {INDUSTRIES.map((ind, i) => (
          <li key={ind.name} onPointerEnter={() => setActive(i)} className="border-b border-white/10">
            <TransitionLink href={`/work?industry=${encodeURIComponent(ind.name)}`} className="group flex items-center justify-between gap-6 py-5 sm:py-7" data-cursor="view" data-cursor-label="Explore">
              <span className="flex items-center gap-4 sm:gap-8">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-md sm:hidden">
                  <Image src={ind.image} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <span className={cn("font-display text-[clamp(2rem,6vw,5.5rem)] transition-all duration-500 ease-(--ease-expo)", active === null || active === i ? "text-bone-50" : "text-bone-50/25", active === i && "sm:translate-x-6 sm:text-accent-300")}>
                  {ind.name}
                </span>
              </span>
              <ArrowUpRight className={cn("size-8 shrink-0 transition-all duration-500", active === i ? "rotate-45 text-accent-300" : "text-mist-600")} />
            </TransitionLink>
          </li>
        ))}
      </ul>
      <div ref={float} aria-hidden className="pointer-events-none fixed top-0 left-0 z-30 hidden sm:block">
        <div className={cn("relative h-[22rem] w-[17rem] overflow-hidden rounded-md transition-[opacity,scale] duration-500 ease-(--ease-expo)", active === null ? "scale-75 opacity-0" : "scale-100 opacity-100")}>
          {INDUSTRIES.map((ind, i) => (
            <Image key={ind.name} src={ind.image} alt="" fill sizes="272px" className={cn("object-cover transition-opacity duration-300", active === i ? "opacity-100" : "opacity-0")} />
          ))}
        </div>
      </div>
    </section>
  );
}
