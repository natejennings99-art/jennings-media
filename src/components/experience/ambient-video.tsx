"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Muted loop that only plays while on screen (and never for reduced-motion users). */
export function AmbientVideo({ src, poster, className, threshold = 0.1 }: { src: string; poster?: string; className?: string; threshold?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()), { threshold });
    io.observe(v);
    return () => io.disconnect();
  }, [threshold]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden className={className} />;
}
