"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/ui/brand-icons";
import type { Reel } from "@/lib/content/work";
import { BRAND } from "@/lib/brand";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "./section-label";

export function ReelsWall({ reels }: { reels: Reel[] }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  return (
    <section className="overflow-hidden py-24 sm:py-36" aria-labelledby="reels-title">
      <div className="gutter mb-12 grid gap-8 sm:mb-16 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <SectionLabel className="mb-8">Social</SectionLabel>
          <SplitReveal as="h2" id="reels-title" className="font-display text-section text-bone-50">
            Made for
            <br />
            the <span className="text-accent-300">feed.</span>
          </SplitReveal>
        </div>
        <div className="lg:col-span-4">
          <p className="max-w-sm text-[16px] leading-relaxed text-mist-400">
            Vertical-first films, reels and listing tours — shot in 4K, cut for Instagram, TikTok and Shorts.
          </p>
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex items-center gap-3 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-accent-300 group-hover:bg-accent-300 group-hover:text-ink-950">
              <InstagramIcon className="size-4" />
            </span>
            {BRAND.instagramHandle}
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </a>
        </div>
      </div>

      <div
        ref={track}
        className="gutter flex snap-x snap-mandatory scroll-px-[clamp(1.25rem,4vw,4rem)] gap-3 overflow-x-auto pb-4 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
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
        onClickCapture={(e) => {
          if (drag.current?.moved) e.preventDefault();
        }}
      >
        {reels.map((r, i) => {
          const external = r.href.startsWith("http");
          const body = (
            <>
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-ink-900">
                <Image src={`/media/video/${r.slug}.jpg`} alt={`${r.label} — ${r.kind}`} fill sizes="(min-width:1024px) 20vw, (min-width:640px) 32vw, 64vw" className="object-cover" />
                <AmbientVideo src={`/media/video/${r.slug}.mp4`} poster={`/media/video/${r.slug}.jpg`} threshold={0.6} className="absolute inset-0 size-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/20" />
                <span className="label absolute top-4 left-4 text-bone-50/80 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="label absolute top-4 right-4 flex items-center gap-1.5 text-bone-50/80">
                  <span className="size-1.5 rounded-full bg-accent-300" /> Reel
                </span>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="label text-accent-300">{r.kind}</p>
                  <p className="mt-1.5 text-[17px] leading-tight font-semibold tracking-tight text-bone-50">{r.label}</p>
                </div>
              </div>
            </>
          );
          const cls = "group w-[64vw] shrink-0 snap-start transition-transform duration-700 ease-(--ease-expo) hover:-translate-y-2 sm:w-[32vw] lg:w-[19vw] lg:max-w-[300px]";
          return external ? (
            <a key={r.slug} href={r.href} target="_blank" rel="noreferrer" className={cls} draggable={false}>
              {body}
            </a>
          ) : (
            <TransitionLink key={r.slug} href={r.href} className={cls} draggable={false}>
              {body}
            </TransitionLink>
          );
        })}
      </div>
    </section>
  );
}
