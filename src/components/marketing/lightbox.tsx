"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export function Lightbox({ items, index, onClose, onIndex }: { items: LightboxItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null;
  const touchX = useRef<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  const go = useCallback(
    (delta: number) => {
      if (index === null) return;
      setLoaded(false);
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, go, onClose]);

  if (!open || index === null) return null;
  const item = items[index];

  return (
    <div
      className="fixed inset-0 z-[80] flex animate-fade-in flex-col bg-ink-950/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? "Image viewer"}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <p className="font-mono text-xs text-mist-400 tabular-nums">
          {index + 1} / {items.length}
        </p>
        <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-50 hover:bg-white/10" aria-label="Close">
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex-1">
        <Image
          key={item.src}
          src={item.src}
          alt={item.alt}
          fill
          sizes="100vw"
          className={cn("object-contain px-2 transition-opacity duration-500 sm:px-20", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          priority
        />
        {!loaded && <div className="absolute inset-0 m-auto size-10 animate-spin rounded-full border-2 border-white/15 border-t-accent-300" />}
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute top-1/2 left-3 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-bone-50 backdrop-blur hover:bg-white/10 sm:grid" aria-label="Previous">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute top-1/2 right-3 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-bone-50 backdrop-blur hover:bg-white/10 sm:grid" aria-label="Next">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center sm:px-8">
        <div>
          {item.title && <p className="text-lg font-medium tracking-[-0.02em] text-bone-50">{item.title}</p>}
          {item.subtitle && <p className="text-sm text-mist-400">{item.subtitle}</p>}
        </div>
        {item.href && (
          <Link href={item.href} onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full bg-bone-50 px-4 py-2 text-sm font-medium text-ink-950">
            View project <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
