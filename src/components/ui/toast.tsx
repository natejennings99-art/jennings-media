"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

const ToastContext = createContext<{ toast: (t: Omit<ToastItem, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-3), { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), t.tone === "error" ? 6500 : 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);
  const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6" aria-live="polite">
        {items.map((item) => {
          const Icon = icons[item.tone];
          return (
            <div
              key={item.id}
              className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl border border-white/10 bg-ink-800/95 p-4 shadow-2xl backdrop-blur-xl"
              role={item.tone === "error" ? "alert" : "status"}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  item.tone === "success" && "text-emerald-300",
                  item.tone === "error" && "text-red-300",
                  item.tone === "info" && "text-accent-300"
                )}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-bone-50">{item.title}</p>
                {item.description && <p className="mt-0.5 text-[13px] text-mist-400">{item.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
