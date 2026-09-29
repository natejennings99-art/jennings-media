"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import type { AgencyService } from "@/lib/content/agency";
import { TransitionLink } from "@/components/experience/transition";
import { cn } from "@/lib/utils";

/**
 * Interactive service index. Desktop: hovering a row swaps the background image
 * and reveals details. Touch: rows expand as an accordion with inline imagery.
 */
export function ServicesList({ services }: { services: AgencyService[] }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden rounded-md lg:block" aria-hidden>
        {services.map((s, i) => (
          <div key={s.slug} className={cn("absolute inset-0 transition-opacity duration-700", active === i ? "opacity-100" : "opacity-0")}>
            <Image src={s.image} alt="" fill sizes="100vw" className={cn("object-cover transition-transform duration-[2000ms] ease-(--ease-expo)", active === i ? "scale-100" : "scale-110")} />
          </div>
        ))}
        <div className="absolute inset-0 bg-ink-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent" />
      </div>

      <ul className="relative border-t border-white/10">
        {services.map((s, i) => {
          const isActive = active === i;
          const isOpen = open === i;
          return (
            <li key={s.slug} className="border-b border-white/10" onPointerEnter={() => setActive(i)}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                onFocus={() => setActive(i)}
                aria-expanded={isOpen}
                className="group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 text-left sm:grid-cols-[5rem_1fr_auto] lg:py-8 lg:gutter"
              >
                <span className={cn("font-mono text-sm transition-colors", isActive ? "text-accent-300" : "text-mist-500")}>{s.number}</span>
                <span className={cn("font-display text-[clamp(1.9rem,5vw,4.75rem)] transition-all duration-500 ease-(--ease-expo)", isActive ? "text-bone-50 lg:translate-x-4" : "text-bone-50/45")}>
                  {s.title}
                </span>
                <span className={cn("grid size-11 place-items-center rounded-full border transition-all duration-500", isActive ? "rotate-45 border-accent-300 bg-accent-300 text-ink-950" : "border-white/20 text-bone-50")}>
                  <span className="lg:hidden">{isOpen ? <Plus className="size-4 rotate-45" /> : <Plus className="size-4" />}</span>
                  <ArrowUpRight className="hidden size-5 lg:block" />
                </span>
              </button>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-700 ease-(--ease-expo)",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  isActive ? "lg:grid-rows-[1fr] lg:opacity-100" : "lg:grid-rows-[0fr] lg:opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="grid gap-6 pb-8 pl-[3.5rem] sm:pl-[6rem] lg:grid-cols-12 lg:gutter lg:pl-[calc(5rem+2rem)]">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-md lg:hidden">
                      <Image src={s.image} alt="" fill sizes="100vw" className="object-cover" />
                    </div>
                    <p className="text-[16px] leading-relaxed text-mist-300 lg:col-span-5">{s.body}</p>
                    <ul className="flex flex-wrap content-start gap-2 lg:col-span-5">
                      {s.deliverables.map((d) => (
                        <li key={d} className="rounded-full border border-white/15 px-3 py-1.5 text-[12.5px] text-bone-100">
                          {d}
                        </li>
                      ))}
                    </ul>
                    <TransitionLink href={`/services#${s.slug}`} className="label self-start text-accent-300 hover:text-bone-50 lg:col-span-2 lg:text-right">
                      Explore →
                    </TransitionLink>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
