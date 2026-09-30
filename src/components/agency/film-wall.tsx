"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Film } from "@/lib/content/real-estate";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { cn } from "@/lib/utils";

function Caption({ film, n }: { film: Film; n: number }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-ink-950/25" />
      <span className="label absolute top-4 left-4 text-bone-50/80 tabular-nums">{String(n).padStart(2, "0")}</span>
      <span className="label absolute top-4 right-4 flex items-center gap-1.5 text-bone-50/80">
        <span className="size-1.5 animate-pulse rounded-full bg-accent-300" /> Film
      </span>
      <div className="absolute inset-x-4 bottom-4">
        {film.place && <p className="label text-accent-300">{film.place}</p>}
        <p className="mt-1.5 text-[17px] leading-tight font-semibold tracking-tight text-bone-50">{film.title}</p>
      </div>
    </>
  );
}

/** Widescreen tours: a grid of 16:9 looping films that play as they scroll into view. */
export function FilmGrid({ films }: { films: Film[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {films.map((f, i) => (
        <figure key={f.slug} className={cn("group relative aspect-video overflow-hidden rounded-xl bg-ink-900", i === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-1")}>
          <Image src={`/media/video/${f.slug}.jpg`} alt={`${f.title}${f.place ? ` — ${f.place}` : ""}`} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.04]" />
          <AmbientVideo src={`/media/video/${f.slug}.mp4`} threshold={0.5} className="absolute inset-0 size-full object-cover" />
          <Caption film={f} n={i + 1} />
        </figure>
      ))}
    </div>
  );
}

/** Vertical reels in a drag-to-scroll rail (touch devices swipe natively). */
export function ReelRail({ films }: { films: Film[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  return (
    <div
      ref={track}
      className="gutter -mx-[clamp(1.25rem,4vw,4rem)] flex snap-x snap-mandatory scroll-px-[clamp(1.25rem,4vw,4rem)] gap-3 overflow-x-auto pb-4 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      data-cursor="drag"
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || !track.current) return;
        drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !track.current) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 4) d.moved = true;
        track.current.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => setTimeout(() => (drag.current = null))}
      onPointerLeave={() => (drag.current = null)}
    >
      {films.map((f, i) => (
        <figure key={f.slug} className="group relative aspect-[9/16] w-[62vw] shrink-0 snap-start overflow-hidden rounded-xl bg-ink-900 sm:w-[30vw] lg:w-[17.5vw] lg:max-w-[290px]">
          <Image src={`/media/video/${f.slug}.jpg`} alt={`${f.title}${f.place ? ` — ${f.place}` : ""}`} fill sizes="(min-width:1024px) 18vw, 62vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.05]" draggable={false} />
          <AmbientVideo src={`/media/video/${f.slug}.mp4`} threshold={0.6} className="absolute inset-0 size-full object-cover" />
          <Caption film={f} n={i + 1} />
        </figure>
      ))}
    </div>
  );
}
