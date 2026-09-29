"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

/** Viewport-sized quotes with drag/swipe, arrows and keyboard navigation. */
export function TestimonialsSlider({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; dx: number; active: boolean }>({ x: 0, dx: 0, active: false });
  const count = items.length;

  const go = useCallback(
    (next: number) => {
      const i = (next + count) % count;
      setIndex(i);
      if (track.current) gsap.to(track.current, { xPercent: -100 * i, duration: prefersReducedMotion() ? 0 : 0.9, ease: "power4.out" });
    },
    [count]
  );

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      drag.current = { x: e.clientX, dx: 0, active: true };
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.dx = e.clientX - drag.current.x;
      gsap.set(el, { x: drag.current.dx * 0.6 });
    };
    const onUp = () => {
      if (!drag.current.active) return;
      const { dx } = drag.current;
      drag.current.active = false;
      gsap.to(el, { x: 0, duration: 0.6, ease: "power3.out" });
      if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [go, index]);

  if (count === 0) return null;
  return (
    <section className="overflow-hidden py-24 sm:py-36" aria-roledescription="carousel" aria-label="Client testimonials">
      <div className="gutter mb-12 flex items-center justify-between sm:mb-16">
        <SectionLabel index="08">What clients say</SectionLabel>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-mist-400 tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => go(index - 1)} className="grid size-11 place-items-center rounded-full border border-white/15 transition hover:border-bone-50 hover:bg-bone-50 hover:text-ink-950" aria-label="Previous testimonial">
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" onClick={() => go(index + 1)} className="grid size-11 place-items-center rounded-full border border-white/15 transition hover:border-bone-50 hover:bg-bone-50 hover:text-ink-950" aria-label="Next testimonial">
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        className="gutter"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
      >
        <div ref={track} className="flex cursor-grab touch-pan-y select-none active:cursor-grabbing" data-cursor="drag">
          {items.map((t, i) => (
            <figure key={t.id} className="w-full shrink-0 pr-4" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={i !== index}>
              <blockquote className={cn("font-display text-[clamp(2rem,5.2vw,5.5rem)] leading-[0.95] text-bone-50 transition-opacity duration-700", i === index ? "opacity-100" : "opacity-20")}>
                <span className="text-accent-300">&ldquo;</span>
                {t.quote}
                <span className="text-accent-300">&rdquo;</span>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-4">
                <span className="h-px w-10 bg-accent-300" />
                <span>
                  <span className="block text-[16px] font-semibold text-bone-50">{t.author_name}</span>
                  <span className="text-[14px] text-mist-400">{[t.author_title, t.company].filter(Boolean).join(", ")}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="gutter mt-12 flex gap-2">
        {items.map((t, i) => (
          <button key={t.id} type="button" onClick={() => go(i)} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10" aria-label={`Show testimonial ${i + 1}`}>
            <span className={cn("absolute inset-y-0 left-0 bg-bone-50 transition-[width] duration-700", i === index ? "w-full" : i < index ? "w-full opacity-40" : "w-0")} />
          </button>
        ))}
      </div>
    </section>
  );
}
