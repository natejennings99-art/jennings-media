"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";

/** Counts up to `value` when scrolled into view. Renders the final value without JS. */
export function Counter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const state = { n: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        n: value,
        duration: 2.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = format(state.n);
        },
      });
    },
    { scope: ref, dependencies: [value] }
  );
  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}
