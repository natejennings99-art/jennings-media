"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Muted loop that only plays while on screen (and never for reduced-motion users). */
export function AmbientVideo({ src, className, threshold = 0.1 }: { src: string; className?: string; threshold?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()), { threshold });
    io.observe(v);
    return () => io.disconnect();
  }, [threshold]);
  // No poster attribute: browsers download posters immediately, even for videos far below the fold.
  // The picture underneath stays visible until this film has its first frame, then it fades in to
  // whatever opacity the caller asked for.
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={cn("transition-opacity duration-500", className, !ready && "opacity-0")}
      onLoadedData={() => setReady(true)}
    />
  );
}
