"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/motion";

/**
 * Masked line-by-line text reveal on scroll (GSAP SplitText with autoSplit,
 * so line breaks stay correct after font load and resize).
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  delay = 0,
  stagger = 0.09,
  start = "top 86%",
  immediate = false,
  id,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
  /** Animate on mount instead of on scroll (for above-the-fold headings). */
  immediate?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.15,
            ease: "power4.out",
            stagger,
            delay,
            ...(immediate ? {} : { scrollTrigger: { trigger: ref.current, start, once: true } }),
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
