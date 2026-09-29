"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Mode = "default" | "link" | "view" | "play" | "drag" | "cta" | "hidden";

/**
 * Custom cursor for fine pointers. Elements opt in with
 * data-cursor="view|play|drag|cta|hide" and an optional data-cursor-label.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let raf = 0;
    let shown = false;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.2;
      pos.y += (target.y - pos.y) * 0.2;
      if (ref.current) ref.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        pos.x = target.x;
        pos.y = target.y;
        setVisible(true);
      }
    };
    const resolve = (el: Element | null) => {
      const hit = el?.closest<HTMLElement>("[data-cursor]");
      if (hit) {
        const m = hit.dataset.cursor as Mode;
        setMode(m === ("hide" as Mode) ? "hidden" : m);
        setLabel(hit.dataset.cursorLabel ?? "");
        return;
      }
      setLabel("");
      setMode(el?.closest("a, button, [role='button'], label, summary") ? "link" : "default");
    };
    const onOver = (e: PointerEvent) => resolve(e.target as Element);
    const onLeaveWindow = () => {
      shown = false;
      setVisible(false);
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  if (!enabled) return null;
  const big = mode === "view" || mode === "play" || mode === "drag" || mode === "cta";
  const text = label || (mode === "view" ? "View" : mode === "play" ? "Play film" : mode === "drag" ? "Drag" : "");

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-[200]" style={{ transform: "translate3d(-100px,-100px,0)" }}>
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color,opacity,transform] duration-300 ease-(--ease-expo)",
          "grid place-items-center overflow-hidden",
          !visible || mode === "hidden" ? "opacity-0" : "opacity-100",
          big ? "size-24 bg-accent-300 text-ink-950" : mode === "link" ? "size-11 border border-bone-50/70 mix-blend-difference" : "size-2.5 bg-bone-50 mix-blend-difference",
          down && "scale-90"
        )}
      >
        {big && (
          <span className="flex items-center gap-1 font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase">
            {mode === "cta" ? <ArrowUpRight className="size-6" strokeWidth={2} /> : text}
          </span>
        )}
      </div>
    </div>
  );
}
