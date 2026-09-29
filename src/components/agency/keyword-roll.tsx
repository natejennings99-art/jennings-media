"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Cycles a headline keyword with a vertical roll. */
export function KeywordRoll({ words, interval = 2600 }: { words: readonly string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion() || words.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return (
    <span className="relative inline-grid overflow-hidden align-bottom text-accent-300">
      {/* Reserve width for the longest word to avoid layout shift. */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      {words.map((w, i) => (
        <span
          key={w}
          aria-hidden={i !== index}
          className="col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-700 ease-(--ease-expo)"
          style={{ transform: `translateY(${i === index ? 0 : i < index ? -105 : 105}%)`, opacity: i === index ? 1 : 0 }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}
