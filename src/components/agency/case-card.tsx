import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/lib/types";
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/types";
import { TransitionLink } from "@/components/experience/transition";
import { cn } from "@/lib/utils";
import { CaseMedia } from "./case-media";

export type CaseLayout = "left" | "right" | "full" | "split" | "grid";

function Meta({ p, large }: { p: PortfolioProject; large?: boolean }) {
  const metric = p.metrics[0];
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <p className="label text-mist-400">
          {p.client_name ?? p.title} <span className="text-mist-600">— {p.year}</span>
        </p>
        <h3 className={cn("mt-3 flex items-start gap-3 font-display text-bone-50 transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-2", large ? "text-[clamp(2rem,4.6vw,4.5rem)]" : "text-[clamp(1.75rem,3.2vw,3rem)]")}>
          {p.title}
          <ArrowUpRight className="mt-[0.1em] size-[0.7em] shrink-0 text-accent-300 transition-transform duration-500 group-hover:rotate-45" strokeWidth={2.5} />
        </h3>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-mist-400">
          {p.categories.map((c) => (
            <span key={c}>{PORTFOLIO_CATEGORY_LABELS[c as keyof typeof PORTFOLIO_CATEGORY_LABELS] ?? c}</span>
          ))}
        </p>
      </div>
      {metric && (
        <div className="sm:text-right">
          <p className="font-display text-[clamp(2.25rem,4vw,3.75rem)] text-accent-300">{metric.value}</p>
          <p className="label mt-1 text-mist-400">{metric.label}</p>
        </div>
      )}
    </div>
  );
}

export function CaseCard({ project: p, layout, priority }: { project: PortfolioProject; layout: CaseLayout; priority?: boolean }) {
  const gallery = p.media.map((m) => m.url);
  const href = `/work/${p.slug}`;

  if (layout === "split") {
    return (
      <TransitionLink href={href} data-cursor="view" className="group grid gap-6 lg:grid-cols-12 lg:gap-10">
        <CaseMedia cover={p.cover_image_url} gallery={gallery} video={p.hover_video_url} alt={p.title} sizes="(min-width:1024px) 55vw, 100vw" className="aspect-[4/5] rounded-md lg:col-span-7" />
        <div className="flex flex-col justify-between gap-8 lg:col-span-5 lg:pt-24">
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-md lg:block">
            <CaseMedia cover={gallery[0] ?? p.cover_image_url} gallery={gallery.slice(1)} video={null} alt="" sizes="30vw" className="absolute inset-0" />
          </div>
          <div>
            <p className="max-w-md text-[15.5px] leading-relaxed text-mist-300">{p.summary}</p>
            <Meta p={p} large />
          </div>
        </div>
      </TransitionLink>
    );
  }

  const frame = {
    left: "lg:w-[70%]",
    right: "lg:ml-auto lg:w-[60%]",
    full: "w-full",
    grid: "w-full",
  }[layout];
  const aspect = layout === "full" ? "aspect-[4/5] sm:aspect-[21/9]" : layout === "grid" ? "aspect-[4/5]" : "aspect-[4/5] sm:aspect-[16/10]";

  return (
    <TransitionLink href={href} data-cursor="view" className={cn("group block", frame)}>
      <CaseMedia
        cover={p.cover_image_url}
        gallery={gallery}
        video={p.hover_video_url}
        alt={p.title}
        priority={priority}
        sizes={layout === "full" ? "100vw" : layout === "grid" ? "(min-width:1024px) 45vw, 100vw" : "(min-width:1024px) 70vw, 100vw"}
        className={cn(aspect, layout === "full" ? "rounded-none" : "rounded-md")}
      />
      <div className={layout === "full" ? "gutter" : undefined}>
        <Meta p={p} large={layout !== "grid"} />
      </div>
    </TransitionLink>
  );
}
