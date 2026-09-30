"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PortfolioProject } from "@/lib/types";
import { PORTFOLIO_CATEGORIES, PORTFOLIO_CATEGORY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CaseCard } from "./case-card";
import { industryMatches } from "@/lib/content/agency";

export function WorkIndex({ projects }: { projects: PortfolioProject[] }) {
  const params = useSearchParams();
  const industry = params.get("industry");
  const [filter, setFilter] = useState<string>("all");
  const available = PORTFOLIO_CATEGORIES.filter((c) => projects.some((p) => p.categories.includes(c)));
  const shown = projects.filter((p) => (filter === "all" || (p.categories as string[]).includes(filter)) && (!industry || industryMatches(industry, p.industry)));

  return (
    <div className="gutter">
      <div className="mb-14 flex flex-wrap items-center justify-between gap-6 border-y border-white/10 py-5">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1" role="tablist" aria-label="Filter work">
          {(["all", ...available] as string[]).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={cn("h-10 shrink-0 rounded-full px-5 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors", filter === c ? "bg-bone-50 text-ink-950" : "text-mist-400 hover:text-bone-50")}
            >
              {c === "all" ? "All" : PORTFOLIO_CATEGORY_LABELS[c as keyof typeof PORTFOLIO_CATEGORY_LABELS]}
            </button>
          ))}
        </div>
        <p className="label text-mist-500">
          {industry ? `${industry} · ` : ""}
          {String(shown.length).padStart(2, "0")} projects
        </p>
      </div>
      {shown.length === 0 ? (
        <p className="py-24 text-center text-mist-400">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-x-10 gap-y-24 md:grid-cols-2">
          {shown.map((p, i) => (
            <div key={p.id} className={cn("animate-fade-up", i % 2 === 1 && "md:mt-40")} style={{ animationDelay: `${(i % 4) * 80}ms` }}>
              <CaseCard project={p} layout="grid" priority={i < 2} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
