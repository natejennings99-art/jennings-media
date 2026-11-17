"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Background hero film. Desktop starts right away; phones wait until the page has loaded so the
 * headline, price and buttons arrive first, with a light poster in the meantime.
 */
export function HeroVideo({ src, mobileSrc, poster, className }: { src: string; mobileSrc?: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    let timer = 0;
    const begin = () => {
      v.preload = "auto";
      v.play().catch(() => undefined);
    };
    const onLoad = () => (timer = window.setTimeout(begin, 600));
    if (!window.matchMedia("(max-width: 767px)").matches) begin();
    else if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
    };
  }, []);
  return (
    <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-hidden>
      {mobileSrc && <source media="(max-width: 767px)" src={mobileSrc} type="video/mp4" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
