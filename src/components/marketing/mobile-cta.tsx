"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, MessageSquare, Phone } from "lucide-react";
import { TransitionLink } from "@/components/experience/transition";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");

/** Persistent phone bar: "Start a project" plus one-tap call and text. Shown after the hero, hidden near the footer. */
export function MobileCta() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - window.innerHeight * 1.2;
      setVisible(window.scrollY > window.innerHeight * 0.8 && !nearEnd);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const round = "grid size-14 shrink-0 place-items-center rounded-full bg-ink-950/90 text-bone-50 ring-1 ring-white/15 backdrop-blur shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)]";
  return (
    <div
      className={cn("fixed inset-x-4 z-30 flex gap-2 transition-all duration-500 ease-(--ease-expo) md:hidden", visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0")}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <TransitionLink href="/contact" className="flex h-14 min-w-0 flex-1 items-center justify-between rounded-full bg-accent-300 pr-2 pl-6 text-[14px] font-semibold tracking-wide text-ink-950 uppercase shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)]">
        Start a project
        <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50">
          <ArrowUpRight className="size-4" />
        </span>
      </TransitionLink>
      <a href={BRAND.phoneHref} className={round} aria-label={`Call ${BRAND.phone}`}>
        <Phone className="size-5" />
      </a>
      <a href={smsHref} className={round} aria-label={`Text ${BRAND.phone}`}>
        <MessageSquare className="size-5" />
      </a>
    </div>
  );
}
