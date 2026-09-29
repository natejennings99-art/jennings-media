"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Scroll-linked parallax + scale for media inside an overflow-hidden frame. */
export function Parallax({ children, className, amount = 10, scale = 1.14 }: { children: ReactNode; className?: string; amount?: number; scale?: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!frame.current || !inner.current || prefersReducedMotion()) return;
      gsap.fromTo(
        inner.current,
        { yPercent: -amount, scale },
        { yPercent: amount, scale: 1, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } }
      );
    },
    { scope: frame }
  );
  return (
    <div ref={frame} className={cn("relative overflow-hidden", className)}>
      <div ref={inner} className="absolute inset-0 will-change-transform">
        {children}
      </div>
    </div>
  );
}

/** Clip-path reveal when the element enters the viewport. */
export function ClipReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      gsap.from(ref.current, {
        clipPath: "inset(18% 10% 18% 10% round 24px)",
        duration: 1.4,
        ease: "power4.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref }
  );
  return (
    <div ref={ref} className={className} style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}>
      {children}
    </div>
  );
}
