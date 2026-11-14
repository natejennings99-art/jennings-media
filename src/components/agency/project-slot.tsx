import { ImagePlus } from "lucide-react";
import { PROJECT_PLACEHOLDER } from "@/lib/content/offers";
import { cn } from "@/lib/utils";

/**
 * An empty portfolio slot: a dashed box that says "[ADD REAL PROJECT]" and what belongs there.
 * Only render it behind showPlaceholders() — it is a note to ourselves, never a fake sample.
 */
export function ProjectSlot({ hint, className }: { hint: string; className?: string }) {
  return (
    <div className={cn("flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-accent-300/50 bg-white/[0.02] p-6 text-center", className)} data-placeholder="project">
      <ImagePlus className="size-6 text-accent-300" aria-hidden />
      <p className="label text-accent-300">{PROJECT_PLACEHOLDER}</p>
      <p className="max-w-[26ch] text-[14px] leading-snug text-mist-400">{hint}</p>
      <p className="text-[12px] text-mist-600">Only you see this box. It is hidden on the live site.</p>
    </div>
  );
}
