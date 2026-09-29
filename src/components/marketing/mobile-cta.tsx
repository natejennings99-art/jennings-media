"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/experience/transition";
import { cn } from "@/lib/utils";

/** Persistent "Start a project" pill on phones, shown after the hero, hidden near the footer. */
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
  return (
    <div
      className={cn("fixed inset-x-4 z-30 transition-all duration-500 ease-(--ease-expo) md:hidden", visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0")}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <TransitionLink href="/contact" className="flex h-14 items-center justify-between rounded-full bg-accent-300 pr-2 pl-6 text-[14px] font-semibold tracking-wide text-ink-950 uppercase shadow-[0_20px_50px_-15px_rgb(0_0_0/0.8)]">
        Start a project
        <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50">
          <ArrowUpRight className="size-4" />
        </span>
      </TransitionLink>
    </div>
  );
}
