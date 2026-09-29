"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Pulls its child toward the cursor on hover (desktop only). */
export function Magnetic({ children, strength = 0.32, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    const inner = el.firstElementChild as HTMLElement | null;
    const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.45)" });
    const ixTo = inner ? gsap.quickTo(inner, "x", { duration: 0.8, ease: "elastic.out(1, 0.45)" }) : null;
    const iyTo = inner ? gsap.quickTo(inner, "y", { duration: 0.8, ease: "elastic.out(1, 0.45)" }) : null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.35);
      iyTo?.(dy * strength * 0.35);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
      ixTo?.(0);
      iyTo?.(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </div>
  );
}
