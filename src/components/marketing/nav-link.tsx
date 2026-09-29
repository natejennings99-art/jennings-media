import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Text that rolls up to a duplicate on hover — the navigation microinteraction. */
export function RollText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span className="block transition-transform duration-500 ease-(--ease-expo) group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-(--ease-expo) group-hover:translate-y-0">
        {children}
      </span>
    </span>
  );
}
