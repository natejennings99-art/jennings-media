"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check, Download, Focus } from "lucide-react";
import { HOW_IT_WORKS } from "@/lib/content/site";
import { IMAGES } from "@/lib/content/images";
import { cn } from "@/lib/utils";

function BookingMock() {
  const days = ["Mon 14", "Tue 15", "Wed 16", "Thu 17"];
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <span key={d} className={cn("flex-1 rounded-xl border px-2 py-2 text-center text-[11px]", i === 1 ? "border-gold-300/50 bg-gold-300/15 text-gold-100" : "border-white/10 text-mist-400")}>
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {["9:00", "10:30", "1:00", "2:30", "4:00", "Twilight"].map((t, i) => (
          <span key={t} className={cn("rounded-lg border py-1.5 text-center text-[11px]", i === 1 ? "border-bone-50 bg-bone-50 text-ink-950" : "border-white/10 text-mist-300")}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-[12px]">
        <span className="flex items-center gap-2 text-mist-300">
          <CalendarDays className="size-3.5" /> Pro package
        </span>
        <span className="font-medium text-bone-50">$450</span>
      </div>
    </div>
  );
}

function CaptureMock() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
      <Image src={IMAGES.livingModern} alt="" fill sizes="360px" className="object-cover" />
      <div className="absolute inset-0 bg-ink-950/20" />
      {["top-3 left-3 border-t border-l", "top-3 right-3 border-t border-r", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"].map((c) => (
        <span key={c} className={cn("absolute size-5 border-bone-50/80", c)} />
      ))}
      <Focus className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-bone-50/70" strokeWidth={1.2} />
      <span className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink-950/60 px-2.5 py-1 font-mono text-[10px] text-bone-50 backdrop-blur">
        <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> REC · 4K 24
      </span>
    </div>
  );
}

function DeliveryMock() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {[IMAGES.kitchenModern, IMAGES.bedroomSuite, IMAGES.bathMarble, IMAGES.heroDusk, IMAGES.livingBright, IMAGES.aerialSuburb].map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
            <Image src={src} alt="" fill sizes="120px" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-bone-50 px-3 py-2.5 text-[12px] font-medium text-ink-950">
        <span className="flex items-center gap-2">
          <Download className="size-3.5" /> Download all (42)
        </span>
        <Check className="size-4 text-emerald-600" />
      </div>
    </div>
  );
}

const MOCKS = [BookingMock, CaptureMock, DeliveryMock];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh * 0.75 - rect.top) / (rect.height * 0.8);
      setProgress(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Progress rail */}
      <div className="absolute top-[3.25rem] right-[16%] left-[16%] hidden h-px bg-white/10 lg:block">
        <div className="h-full origin-left bg-gradient-to-r from-gold-300 to-gold-500 shadow-[0_0_20px_rgb(230_201_152/0.8)]" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {HOW_IT_WORKS.map((step, i) => {
          const Mock = MOCKS[i];
          const active = progress >= i / 3 + 0.05;
          return (
            <div key={step.step} className="relative">
              <div className="mb-8 flex items-center gap-4 lg:justify-center">
                <span
                  className={cn(
                    "relative grid size-[6.5rem] place-items-center rounded-full border font-mono text-2xl transition-all duration-700 ease-(--ease-expo)",
                    active ? "border-gold-300/60 bg-gold-300/10 text-gold-100 shadow-[0_0_60px_-10px_rgb(230_201_152/0.6)]" : "border-white/10 bg-ink-900 text-mist-500"
                  )}
                >
                  {step.step}
                </span>
              </div>
              <div
                className={cn(
                  "surface h-full rounded-[28px] p-6 transition-all duration-700 ease-(--ease-expo) sm:p-7",
                  active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-60"
                )}
              >
                <div className="rounded-2xl border border-white/[0.07] bg-ink-950/60 p-4">
                  <Mock />
                </div>
                <h3 className="mt-7 text-2xl font-medium tracking-[-0.035em] text-bone-50">{step.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-mist-400">{step.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
