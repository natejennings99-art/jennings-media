"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Maximize2, Play } from "lucide-react";
import type { PortfolioCategory, PortfolioProject } from "@/lib/types";
import { PORTFOLIO_CATEGORIES } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";
import { Lightbox, type LightboxItem } from "./lightbox";

const ASPECTS = ["aspect-[4/5]", "aspect-[4/3]", "aspect-square", "aspect-[3/4]", "aspect-[16/11]"];

export function PortfolioGrid({ projects, limit, showFilters = true }: { projects: PortfolioProject[]; limit?: number; showFilters?: boolean }) {
  const [filter, setFilter] = useState<PortfolioCategory | "all">("all");
  const [active, setActive] = useState<number | null>(null);

  const available = useMemo(
    () => PORTFOLIO_CATEGORIES.filter((c) => projects.some((p) => p.categories.includes(c))),
    [projects]
  );
  const shown = useMemo(() => {
    const list = filter === "all" ? projects : projects.filter((p) => p.categories.includes(filter));
    return limit ? list.slice(0, limit) : list;
  }, [projects, filter, limit]);

  const items: LightboxItem[] = shown.map((p) => ({
    src: p.cover_image_url ?? p.media[0]?.url ?? "",
    alt: p.title,
    title: p.title,
    subtitle: [p.neighborhood, p.property_type].filter(Boolean).join(" · "),
    href: `/portfolio/${p.slug}`,
  }));

  return (
    <div>
      {showFilters && available.length > 1 && (
        <div className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter portfolio">
          {(["all", ...available] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4.5 text-[13.5px] transition-all duration-300",
                filter === c ? "border-bone-50 bg-bone-50 text-ink-950" : "border-white/10 text-mist-300 hover:border-white/25 hover:text-bone-50"
              )}
            >
              {c === "all" ? "All work" : titleCase(c)}
            </button>
          ))}
        </div>
      )}

      <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3 [&>*]:mb-3 sm:[&>*]:mb-4">
        {shown.map((p, i) => (
          <button
            key={`${filter}-${p.id}`}
            type="button"
            onClick={() => setActive(i)}
            className="group relative block w-full animate-fade-up overflow-hidden rounded-[24px] border border-white/[0.07] bg-ink-900 text-left break-inside-avoid"
            style={{ animationDelay: `${(i % 6) * 70}ms` }}
          >
            <div className={cn("relative w-full", ASPECTS[i % ASPECTS.length])}>
              {p.cover_image_url && (
                <Image
                  src={p.cover_image_url}
                  alt={p.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.06]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              {p.categories.includes("video") && (
                <span className="glass absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] text-bone-50">
                  <Play className="size-3 fill-current" /> Film
                </span>
              )}
              <span className="glass absolute top-4 right-4 grid size-9 scale-90 place-items-center rounded-full text-bone-50 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                <Maximize2 className="size-4" />
              </span>
              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 transition-transform duration-500 ease-(--ease-expo) group-hover:translate-y-0">
                <p className="text-lg font-medium tracking-[-0.02em] text-bone-50">{p.title}</p>
                <p className="mt-0.5 text-[13px] text-mist-300">
                  {[p.neighborhood, p.property_type].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {p.services_performed.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-bone-100 backdrop-blur">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Lightbox items={items} index={active} onClose={() => setActive(null)} onIndex={setActive} />
    </div>
  );
}
