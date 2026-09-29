"use client";

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from "react";

/**
 * Scroll-triggered reveal using IntersectionObserver + CSS transitions
 * (see [data-reveal] in globals.css). Zero animation-library cost.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  variant = "up",
  className,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  variant?: "up" | "fade" | "scale";
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          if (once) observer.disconnect();
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      data-reveal={variant === "up" ? "" : variant}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
