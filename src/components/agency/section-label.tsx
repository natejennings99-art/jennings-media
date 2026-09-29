import { cn } from "@/lib/utils";

/** "(01) — Selected work" section index label. */
export function SectionLabel({ index, children, className }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("label flex items-center gap-3 text-mist-400", className)}>
      {index && <span className="text-accent-300">({index})</span>}
      <span className="h-px w-8 bg-white/20" />
      {children}
    </p>
  );
}
