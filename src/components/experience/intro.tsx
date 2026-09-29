"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";

// Dev StrictMode unmounts and remounts immediately; only a real unmount should clear the intro.
let pendingClear = 0;

/**
 * First-visit intro: emblem, wordmark and a 000→100 counter, then a curtain
 * lift. Visibility is decided by INTRO_GATE before paint (CSS keeps it hidden
 * otherwise, so no-JS visitors never see it); hero animations wait underneath.
 */
export function Intro() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    clearTimeout(pendingClear);
    if (!root.classList.contains("intro-on")) return;
    const start = performance.now();
    const total = 1150;
    let raf = 0;
    let timer = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / total);
      setCount(Math.round(100 * (1 - Math.pow(1 - p, 3))));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      root.classList.add("intro-leaving");
      timer = window.setTimeout(() => root.classList.remove("intro-on", "intro-leaving"), 800);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      pendingClear = window.setTimeout(() => root.classList.remove("intro-on", "intro-leaving"), 120);
    };
  }, []);

  return (
    <div className="intro" aria-hidden>
      <div className="intro-inner">
        <Image src={BRAND.emblem} alt="" width={96} height={96} priority className="intro-emblem rounded-full" />
        <p className="intro-word font-display">
          {BRAND.name}
          <span className="text-accent-300">.</span>
        </p>
      </div>
      <p className="intro-count label tabular-nums">{String(count).padStart(3, "0")}</p>
    </div>
  );
}
