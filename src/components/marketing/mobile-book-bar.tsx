"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Persistent "Book a Shoot" bar on phones, shown after the hero. */
export function MobileBookBar({ fromPrice }: { fromPrice: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 transition-all duration-500 ease-(--ease-expo) md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="glass flex items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.8)]">
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.14em] text-mist-400">Packages from</p>
          <p className="text-[15px] font-medium text-bone-50">{fromPrice}</p>
        </div>
        <Link
          href="/book"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-300 px-6 text-[15px] font-medium text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] active:scale-[0.97]"
        >
          Book a Shoot
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
