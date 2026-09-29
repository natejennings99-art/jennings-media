"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Clapperboard, Images, Box, Ruler } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { HERO } from "@/lib/content/site";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  src: string;
  title: string;
  caption: string;
}

const NOTIFICATIONS = [
  { icon: Images, title: "Photos delivered", meta: "42 hand-edited images", time: "8:02 AM" },
  { icon: Clapperboard, title: "Cinematic film ready", meta: "4K · 1 min 24 s", time: "Yesterday" },
  { icon: Box, title: "3D tour is live", meta: "Branded + MLS links", time: "Tue" },
  { icon: Ruler, title: "Floor plan added", meta: "2,850 sq ft · PDF + PNG", time: "Mon" },
];

const SLIDE_MS = 6500;

export function Hero({ slides, videoUrl }: { slides: HeroSlide[]; videoUrl?: string | null }) {
  const [index, setIndex] = useState(0);
  const [mountAll, setMountAll] = useState(false);
  const [note, setNote] = useState(0);

  useEffect(() => {
    const warm = setTimeout(() => setMountAll(true), 1800);
    return () => clearTimeout(warm);
  }, []);

  useEffect(() => {
    if (videoUrl || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(t);
  }, [slides.length, videoUrl]);

  useEffect(() => {
    const t = setInterval(() => setNote((n) => (n + 1) % NOTIFICATIONS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const words = [...HERO.headlineLead.split(" "), `__accent__${HERO.headlineAccent}`, ...HERO.headlineTail.split(" ")];
  const current = slides[index];

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      {/* Media layer */}
      <div className="absolute inset-0 -z-10 bg-ink-900">
        {videoUrl ? (
          <video
            className="absolute inset-0 size-full object-cover"
            src={videoUrl}
            poster={slides[0]?.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          slides.map((slide, i) =>
            i === 0 || mountAll ? (
              <div
                key={slide.src}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
                  i === index ? "opacity-100" : "opacity-0"
                )}
                aria-hidden={i !== index}
              >
                <div key={i === index ? `active-${index}` : "idle"} className={cn("absolute inset-0", i === index && "animate-kenburns")}>
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(7_8_10/0.65)_100%)]" />
      </div>

      <div className="container-page grid gap-10 pt-32 pb-16 sm:pb-20 lg:grid-cols-12 lg:items-end lg:pb-24">
        <div className="lg:col-span-8">
          <div className="glass mb-7 inline-flex animate-fade-up items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-[12.5px] text-bone-100">
            <span className="relative grid size-5 place-items-center rounded-full bg-emerald-400/15">
              <span className="size-2 animate-pulse-ring rounded-full bg-emerald-400" />
            </span>
            Now booking · Next-morning delivery
          </div>

          <h1 className="text-[clamp(2.9rem,8.4vw,7.6rem)] leading-[0.92] font-medium tracking-[-0.055em] text-bone-50">
            {words.map((word, i) => {
              const accent = word.startsWith("__accent__");
              return (
                <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span
                    className={cn(
                      "inline-block animate-fade-up",
                      accent && "pr-[0.06em] font-serif font-normal italic tracking-[-0.03em] text-gradient-gold"
                    )}
                    style={{ animationDelay: `${150 + i * 70}ms` }}
                  >
                    {accent ? word.replace("__accent__", "") : word}
                  </span>
                  {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
              );
            })}
          </h1>

          <p className="mt-7 max-w-xl animate-fade-up text-pretty text-base leading-relaxed text-mist-300 [animation-delay:700ms] sm:text-lg">
            {HERO.subheadline}
          </p>

          <div className="mt-9 flex animate-fade-up flex-col gap-3 [animation-delay:850ms] sm:flex-row">
            <Link href="/book" className={buttonStyles({ size: "xl", className: "w-full sm:w-auto" })}>
              Book a Shoot
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
            <Link href="/services" className={buttonStyles({ variant: "secondary", size: "xl", className: "w-full sm:w-auto" })}>
              View Services
            </Link>
          </div>
        </div>

        {/* Floating delivery feed */}
        <div className="hidden animate-fade-up [animation-delay:1100ms] lg:col-span-4 lg:block">
          <div className="animate-float">
            <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow">Client dashboard</p>
                <span className="text-[11px] text-emerald-300">● Live</span>
              </div>
              <div className="relative h-[216px]">
                {NOTIFICATIONS.map((n, i) => {
                  const offset = (i - note + NOTIFICATIONS.length) % NOTIFICATIONS.length;
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.title}
                      className="absolute inset-x-0 flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-ink-900/70 p-3.5 transition-all duration-700 ease-(--ease-expo)"
                      style={{
                        transform: `translateY(${offset * 72}px) scale(${1 - offset * 0.03})`,
                        opacity: offset > 2 ? 0 : 1 - offset * 0.28,
                        zIndex: 10 - offset,
                      }}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-300/12 text-gold-200">
                        <Icon className="size-4.5" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-bone-50">
                          {n.title}
                          <Check className="size-3.5 text-emerald-300" />
                        </span>
                        <span className="block truncate text-[12px] text-mist-400">{n.meta}</span>
                      </span>
                      <span className="text-[11px] text-mist-500">{n.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide caption + progress */}
      {!videoUrl && current && (
        <div className="container-page hidden items-center justify-between pb-8 sm:flex">
          <p className="text-[12.5px] text-mist-400">
            <span className="text-bone-100">{current.title}</span> · {current.caption}
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-mist-400 tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  className="relative h-[3px] w-10 overflow-hidden rounded-full bg-white/15"
                  aria-label={`Show ${s.title}`}
                >
                  <span
                    key={`${index}-${i}`}
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full bg-bone-50",
                      i < index && "w-full",
                      i === index && "w-0 animate-[grow_6.5s_linear_forwards]",
                      i > index && "w-0"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes grow { to { width: 100%; } }`}</style>
    </section>
  );
}
