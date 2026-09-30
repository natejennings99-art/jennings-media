"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { embedUrl } from "@/lib/media-embed";
import { cn } from "@/lib/utils";
import { SplitReveal } from "@/components/experience/split-reveal";
import { SectionLabel } from "./section-label";

function Timecode() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame((f) => f + 1), 1000 / 24);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(frame / 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="tabular-nums">
      00:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}:{pad(frame % 24)}
    </span>
  );
}

type Clip = { src: string; poster: string };

/** Muted preview reel: cycles short clips, only the visible one decodes. Poster-only for reduced motion. */
function Montage({ clips, active = true }: { clips: Clip[]; active?: boolean }) {
  const [index, setIndex] = useState(0);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % clips.length), 3200);
    return () => clearInterval(t);
  }, [active, clips.length]);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index && active) {
        v.currentTime = 0;
        v.play().catch(() => undefined);
      } else v.pause();
    });
  }, [index, active]);
  return (
    <>
      {clips.map((c, i) => {
        const near = i === index || i === (index + 1) % clips.length || i === (index - 1 + clips.length) % clips.length;
        if (!near) return null;
        return (
          <div key={c.src} className={cn("absolute inset-0 transition-opacity duration-700", i === index ? "opacity-100" : "opacity-0")} aria-hidden={i !== index}>
            <Image src={c.poster} alt="" fill sizes="100vw" className="object-cover" />
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={c.src}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500"
              onLoadedData={(e) => (e.currentTarget.style.opacity = "1")}
            />
          </div>
        );
      })}
    </>
  );
}

export function Showreel({ videoUrl, clips }: { videoUrl: string | null; clips: Clip[] }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const embed = embedUrl(videoUrl);

  // Only load and cycle the preview reel while it's near the viewport.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "300px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        frame.current,
        { scale: 0.86, borderRadius: 48 },
        {
          scale: 1,
          borderRadius: 8,
          ease: "none",
          scrollTrigger: {
            trigger: frame.current,
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <section ref={root} id="showreel" className="scroll-mt-20 py-28 sm:py-40" aria-labelledby="showreel-title">
      <div className="gutter mb-12 grid gap-8 sm:mb-20 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-9">
          <SectionLabel index="01" className="mb-8">
            Showreel
          </SectionLabel>
          <SplitReveal as="h2" id="showreel-title" className="font-display text-section text-bone-50">
            We make things
            <br />
            people <span className="text-accent-300">remember.</span>
          </SplitReveal>
        </div>
        <p className="max-w-sm text-[16px] leading-relaxed text-mist-400 lg:col-span-3">
          Brand films, listing launches and social campaigns — a few seconds of real work, shot and cut in-house.
        </p>
      </div>

      <div className="gutter">
        <button
          ref={frame}
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="play"
          className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-ink-900 will-change-transform sm:aspect-video"
          aria-label="Play showreel"
        >
          <div className="absolute inset-0 transition-transform duration-[1200ms] ease-(--ease-expo) group-hover:scale-[1.035]">
            <Montage clips={clips} active={!open && inView} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-ink-950/30" />
          <div className="label absolute top-5 left-5 flex items-center gap-2 text-bone-50 sm:top-7 sm:left-7">
            <span className="size-2 animate-pulse rounded-full bg-accent-300" /> Rec · Showreel {new Date().getFullYear()}
          </div>
          <div className="label absolute top-5 right-5 text-bone-50/80 sm:top-7 sm:right-7">
            <Timecode />
          </div>
          <span className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-bone-50 py-2 pr-5 pl-2 text-[13px] font-semibold tracking-[0.08em] text-ink-950 uppercase sm:hidden">
            <span className="grid size-8 place-items-center rounded-full bg-accent-300">
              <Play className="size-3.5 fill-current" />
            </span>
            Play film
          </span>
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Showreel"
          className="fixed inset-0 z-[160] flex animate-fade-in items-center justify-center bg-ink-950/95 p-4 backdrop-blur-xl sm:p-10"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 grid size-12 place-items-center rounded-full bg-bone-50 text-ink-950"
            aria-label="Close showreel"
            autoFocus
          >
            <X className="size-5" />
          </button>
          <div
            className={cn("relative w-full max-w-7xl overflow-hidden rounded-lg bg-black", embed || !videoUrl ? "aspect-video" : "h-[82svh]")}
            onClick={(e) => e.stopPropagation()}
          >
            {embed ? (
              <iframe
                src={`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`}
                title="Showreel"
                className="absolute inset-0 size-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : videoUrl ? (
              <video className="absolute inset-0 size-full" src={videoUrl} poster={videoUrl.replace(/\.mp4$/, ".jpg")} autoPlay controls playsInline />
            ) : (
              <>
                <Montage clips={clips} />
                <p className="label absolute bottom-5 left-5 text-bone-50/80">Full showreel coming soon</p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
