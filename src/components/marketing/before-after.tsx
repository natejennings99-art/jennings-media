"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

/**
 * Drag-to-compare slider: an unprocessed "straight out of camera" rendering vs.
 * the finished edit. Keyboard and screen-reader accessible via a range input.
 */
export function BeforeAfter({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [hinted, setHinted] = useState(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  // Gentle auto-sweep the first time the slider scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el || hinted) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setHinted(true);
        const frames = [50, 28, 72, 50];
        frames.forEach((v, i) => setTimeout(() => setPos(v), 400 + i * 650));
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hinted]);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full cursor-ew-resize touch-pan-y overflow-hidden rounded-[28px] border border-white/10 select-none sm:aspect-[16/9]"
      onPointerDown={(e) => {
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <Image src={src} alt={alt} fill sizes="(min-width:1024px) 70vw, 100vw" className="object-cover" />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: dragging ? "none" : "clip-path 600ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width:1024px) 70vw, 100vw"
          className="object-cover [filter:saturate(0.45)_brightness(0.72)_contrast(0.82)_sepia(0.18)_blur(0.3px)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(120_130_140/0.18),rgb(40_40_40/0.25))]" />
      </div>

      <span className="glass absolute top-4 left-4 rounded-full px-3 py-1.5 font-mono text-[10.5px] tracking-[0.16em] text-bone-100 uppercase">
        Straight out of camera
      </span>
      <span className="absolute top-4 right-4 rounded-full bg-gold-300 px-3 py-1.5 font-mono text-[10.5px] tracking-[0.16em] text-ink-950 uppercase">
        Jennings edit
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-bone-50/90 shadow-[0_0_20px_rgb(255_255_255/0.6)]"
        style={{ left: `${pos}%`, transition: dragging ? "none" : "left 600ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-ink-950/60 text-bone-50 backdrop-blur-md">
          <MoveHorizontal className="size-5" />
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare before and after editing"
        className="peer sr-only"
      />
    </div>
  );
}
