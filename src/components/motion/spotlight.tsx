"use client";

import { useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Card with a soft light that follows the cursor. */
export function Spotlight({ className, children, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={cn("spotlight", className)}
      {...props}
    >
      {children}
    </div>
  );
}
