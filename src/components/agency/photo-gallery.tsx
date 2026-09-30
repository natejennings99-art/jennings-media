"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import type { Photo } from "@/lib/content/photos";
import { Lightbox } from "@/components/marketing/lightbox";
import { cn } from "@/lib/utils";

/** Masonry photo grid at each photo's natural shape; click any photo to view it full screen. */
export function PhotoGallery({ photos, columns = 3, className }: { photos: Photo[]; columns?: 2 | 3 | 4; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <div className={cn("columns-2 gap-3 sm:gap-4", columns >= 3 && "lg:columns-3", columns === 4 && "xl:columns-4", className)}>
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            data-cursor="view"
            data-cursor-label="View"
            aria-label={`View photo: ${p.alt}`}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl bg-ink-900 sm:mb-4"
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={p.w}
              height={p.h}
              sizes={columns === 4 ? "(min-width:1280px) 25vw, (min-width:1024px) 33vw, 50vw" : "(min-width:1024px) 33vw, 50vw"}
              className="h-auto w-full transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.04]"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-left opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="text-[13px] leading-snug font-medium text-bone-50">{p.alt}</span>
              <Expand className="size-4 shrink-0 text-accent-300" aria-hidden />
            </span>
          </button>
        ))}
      </div>
      <Lightbox items={photos.map((p) => ({ src: p.src, alt: p.alt, title: p.alt }))} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
