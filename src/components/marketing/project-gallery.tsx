"use client";

import Image from "next/image";
import { useState } from "react";
import type { PortfolioMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";

export function ProjectGallery({ media, title }: { media: PortfolioMedia[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const photos = media.filter((m) => m.kind !== "video");
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {photos.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "group relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-ink-900",
              i % 5 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/3]"
            )}
          >
            <Image src={m.url} alt={m.alt ?? title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-1000 ease-(--ease-expo) group-hover:scale-105" />
            {m.kind === "drone" && <span className="glass absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px]">Drone</span>}
          </button>
        ))}
      </div>
      <Lightbox
        items={photos.map((m) => ({ src: m.url, alt: m.alt ?? title, title, subtitle: m.caption ?? m.alt ?? undefined }))}
        index={active}
        onClose={() => setActive(null)}
        onIndex={setActive}
      />
    </>
  );
}
