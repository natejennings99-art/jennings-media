"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible modal / slide-over built on the native <dialog> element
 * (focus trapping, Esc to close, inert background).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "modal",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "modal" | "sheet";
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 text-bone-50 backdrop:bg-ink-950/70 backdrop:backdrop-blur-sm open:animate-fade-in",
        variant === "sheet" ? "ml-auto h-dvh w-full sm:w-[min(560px,100vw)]" : "m-auto w-[min(640px,calc(100vw-2rem))]"
      )}
    >
      <div
        className={cn(
          "flex max-h-dvh flex-col border border-white/10 bg-ink-850 shadow-2xl",
          variant === "sheet" ? "h-dvh sm:rounded-l-3xl" : "max-h-[calc(100dvh-2rem)] rounded-3xl",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
            <div>
              {title && <h2 className="text-lg font-medium tracking-[-0.02em]">{title}</h2>}
              {description && <p className="mt-1 text-sm text-mist-400">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 grid size-9 place-items-center rounded-full text-mist-400 transition hover:bg-white/10 hover:text-bone-50"
              aria-label="Close"
            >
              <X className="size-4.5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] px-6 py-4">{footer}</div>}
      </div>
    </dialog>
  );
}
