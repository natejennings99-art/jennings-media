"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { ArrowDownRight, ArrowUpRight, House } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import { HERO_KEYWORDS } from "@/lib/content/agency";
import { BRAND } from "@/lib/brand";
import { Magnetic } from "@/components/experience/magnetic";
import { TransitionLink } from "@/components/experience/transition";
import { RollText } from "@/components/marketing/nav-link";
import { KeywordRoll } from "./keyword-roll";

const HeroCanvas = dynamic(() => import("@/components/webgl/hero-canvas"), { ssr: false });

const LINES = [["We", "make", "brands"], ["impossible"], ["to"]];

export function Hero({ videoUrl, trustLine, clients, priceLine }: { videoUrl: string | null; trustLine: string; clients: string[]; priceLine?: string }) {
  const root = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        video.current?.pause();
        return;
      }
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(media.current, { scale: 1.15, yPercent: 8, ease: "none", scrollTrigger: st });
      gsap.to(content.current, { yPercent: -18, opacity: 0.1, ease: "none", scrollTrigger: st });
    },
    { scope: root }
  );

  // Keep the background film playing: resume after tab switches, rest while scrolled away.
  // Phones wait for the page to finish loading before fetching the film, so the headline,
  // price and buttons arrive first; the light poster covers the gap.
  useEffect(() => {
    const v = video.current;
    if (!v || prefersReducedMotion()) return;
    let ready = false;
    let onScreen = true;
    let timer = 0;
    const sync = (visible: boolean) => {
      if (!ready) return;
      if (visible && document.visibilityState === "visible") v.play().catch(() => undefined);
      else v.pause();
    };
    const begin = () => {
      ready = true;
      v.preload = "auto";
      sync(onScreen);
    };
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const onLoad = () => (timer = window.setTimeout(begin, 600));
    if (!phone) begin();
    else if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    const io = new IntersectionObserver(([e]) => sync((onScreen = e.isIntersecting)), { threshold: 0.05 });
    const onVis = () => sync(onScreen);
    io.observe(v);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  let word = 0;
  return (
    <section ref={root} data-hero className="relative isolate flex min-h-[100svh] flex-col overflow-hidden" aria-label="Introduction">
      <div ref={media} className="absolute inset-0 -z-10 will-change-transform" style={{ background: "radial-gradient(ellipse at 70% 35%, rgb(255 91 36 / 0.16), transparent 55%), #07080a" }}>
        {videoUrl ? (
          <video
            ref={video}
            className="absolute inset-0 size-full object-cover opacity-60"
            poster={videoUrl.endsWith("/media/video/hero.mp4") ? "/media/video/hero-mobile.webp" : videoUrl.startsWith("/media/") ? videoUrl.replace(/\.mp4$/, ".jpg") : undefined}
            muted
            loop
            playsInline
            preload="none"
          >
            {/* Phones get a lighter 720p cut of the same film. */}
            {videoUrl.endsWith("/media/video/hero.mp4") && <source src={videoUrl.replace("hero.mp4", "hero-mobile.mp4")} media="(max-width: 767px)" type="video/mp4" />}
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <HeroCanvas className="absolute inset-0 size-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-transparent to-ink-950" />
      </div>

      <div ref={content} className="gutter flex flex-1 flex-col justify-end pt-32 pb-10 sm:pb-14">
        <div className="mb-8 flex items-center justify-between gap-6 sm:mb-12">
          <h1 className="label animate-fade-in text-[13px] text-bone-50 [animation-delay:200ms] sm:text-[15px]">
            <span className="text-accent-300" aria-hidden>●</span> Tampa real estate photography &amp; video
          </h1>
          <p className="label hidden animate-fade-in text-mist-400 [animation-delay:300ms] sm:block">
            {BRAND.location} — Worldwide
          </p>
        </div>

        <TransitionLink
          href="/test-reel"
          className="group mb-6 inline-flex max-w-full animate-fade-in items-center gap-3 self-start rounded-full border border-accent-300/50 bg-ink-950/50 py-1.5 pr-2 pl-4 text-[13px] font-medium text-bone-50 backdrop-blur-md transition-colors [animation-delay:350ms] hover:border-accent-300 hover:bg-accent-300 hover:text-ink-950 sm:mb-8"
        >
          <span className="size-1.5 shrink-0 rounded-full bg-accent-300 group-hover:bg-ink-950" />
          <span className="sm:hidden">Venues: get a free 15-second test reel</span>
          <span className="hidden sm:inline">Venues in DC &amp; Miami: get a free 15-second test reel</span>
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent-300 text-ink-950 transition-transform duration-500 group-hover:rotate-45 group-hover:bg-ink-950 group-hover:text-bone-50">
            <ArrowUpRight className="size-3.5" />
          </span>
        </TransitionLink>

        <p className="font-display text-hero text-bone-50" aria-label={`We make brands impossible to ${HERO_KEYWORDS[0].toLowerCase()}`}>
          {LINES.map((line, li) => (
            <span key={li} className="block overflow-hidden pb-[0.04em]">
              {line.map((w) => {
                const delay = 120 + word++ * 90;
                return (
                  <span key={w} className="mr-[0.22em] inline-block animate-[rise_1.2s_var(--ease-expo)_both]" style={{ animationDelay: `${delay}ms` }}>
                    {w}
                  </span>
                );
              })}
              {li === 2 && (
                <span className="inline-block animate-[rise_1.2s_var(--ease-expo)_both]" style={{ animationDelay: `${120 + word * 90}ms` }}>
                  <KeywordRoll words={HERO_KEYWORDS} />
                </span>
              )}
            </span>
          ))}
        </p>

        <div className="mt-10 grid items-end gap-8 sm:mt-14 lg:grid-cols-12">
          <p className="max-w-md animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:900ms] lg:col-span-5">
            Listing photos, cinematic video and drone for Tampa Bay agents{priceLine ? <> — <span className="text-bone-50">{priceLine.charAt(0).toLowerCase() + priceLine.slice(1)}</span></> : null}, next-day photos. Plus ads, social content and lead generation for local businesses.{" "}
            <a href={BRAND.phoneHref} className="whitespace-nowrap text-bone-50 underline underline-offset-4 hover:text-accent-300">
              Call or text {BRAND.phone}
            </a>
          </p>
          <div className="flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:1050ms] lg:col-span-7 lg:justify-end">
            <Magnetic>
              <TransitionLink
                href="/book"
                data-cursor="cta"
                className="group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
              >
                <RollText>Book a shoot</RollText>
                <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" />
                </span>
              </TransitionLink>
            </Magnetic>
            <TransitionLink
              href="/real-estate"
              className="group inline-flex h-15 items-center gap-3 rounded-full border border-white/25 bg-ink-950/30 px-6 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase backdrop-blur-md transition-colors duration-300 hover:border-bone-50 hover:bg-bone-50 hover:text-ink-950"
            >
              <House className="size-4" aria-hidden />
              Real estate media
            </TransitionLink>
            <TransitionLink href="/contact" className="group inline-flex h-15 items-center gap-2 px-3 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:0%_1px] group-hover:bg-right">
                Marketing? Start a project
              </span>
              <ArrowDownRight className="size-4 transition-transform duration-500 group-hover:-rotate-45" />
            </TransitionLink>
          </div>
        </div>

        <div className="mt-12 flex animate-fade-in flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6 [animation-delay:1300ms]">
          {trustLine ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="label text-mist-400">{trustLine}</span>
              <span className="hidden items-center gap-5 text-[13px] font-semibold tracking-tight text-mist-500 md:flex">
                {clients.slice(0, 4).map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </span>
            </div>
          ) : (
            <span className="label text-mist-400">{BRAND.tagline}</span>
          )}
          <a href="#showreel" className="label group flex items-center gap-3 text-mist-400 hover:text-bone-50" aria-label="Scroll to showreel">
            Scroll
            <span className="relative block h-8 w-px overflow-hidden bg-white/15">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-bone-50" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
