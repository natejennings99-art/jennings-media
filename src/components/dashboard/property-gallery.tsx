"use client";

import { useState } from "react";
import { Lightbox } from "@/components/marketing/lightbox";
import { cn } from "@/lib/utils";

export function PropertyGallery({ photos }: { photos: { src: string; alt: string }[] }) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {photos.map((p, i) => (
          <button key={p.src} type="button" onClick={() => setActive(i)} className={cn("group relative overflow-hidden rounded-[22px] bg-ink-900", i % 7 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} loading={i < 3 ? "eager" : "lazy"} className="size-full object-cover transition duration-1000 group-hover:scale-105" />
          </button>
        ))}
      </div>
      <Lightbox items={photos.map((p) => ({ src: p.src, alt: p.alt }))} index={active} onClose={() => setActive(null)} onIndex={setActive} />
    </>
  );
}
