"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps, type MouseEvent, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import { BRAND } from "@/lib/brand";
import { scrollToTop } from "./smooth-scroll";

const TransitionContext = createContext<{ navigate: (href: string) => void } | null>(null);

/**
 * Page transitions for the marketing site: an accent panel wipes up, the next
 * route loads underneath (prefetched), then the panel wipes away (~0.9s total).
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);
  const failsafe = useRef(0);

  /** Hide the panel and accept clicks again. */
  const release = useCallback(() => {
    clearTimeout(failsafe.current);
    if (panel.current) gsap.set(panel.current, { display: "none" });
    busy.current = false;
    ScrollTrigger.refresh();
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const target = new URL(href, window.location.href);
      if (busy.current) return;
      if (target.pathname === window.location.pathname) {
        router.push(href);
        return;
      }
      if (prefersReducedMotion() || !panel.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      router.prefetch(href);
      gsap
        .timeline({
          onComplete: () => {
            router.push(href);
            // If the route never changes (redirect back, network stall), don't leave the panel covering the page.
            failsafe.current = window.setTimeout(() => busy.current && release(), 7000);
          },
        })
        .set(panel.current, { display: "flex", yPercent: 100 })
        .to(panel.current, { yPercent: 0, duration: 0.5, ease: "power4.inOut" })
        .fromTo(word.current, { yPercent: 120 }, { yPercent: 0, duration: 0.4, ease: "power3.out" }, "-=0.25");
    },
    [router, release]
  );

  // Any route change that follows one of our transitions reveals the new page — even if a redirect landed elsewhere.
  useEffect(() => {
    if (!busy.current || !panel.current) return;
    clearTimeout(failsafe.current);
    scrollToTop();
    gsap
      .timeline({ delay: 0.08, onComplete: release })
      .to(word.current, { yPercent: -120, duration: 0.3, ease: "power3.in" })
      .to(panel.current, { yPercent: -100, duration: 0.55, ease: "power4.inOut" }, "-=0.1");
  }, [pathname, release]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={panel} aria-hidden className="fixed inset-0 z-[150] hidden items-center justify-center bg-accent-300">
        <span className="overflow-hidden">
          <span ref={word} className="block font-display text-[clamp(3rem,12vw,10rem)] text-ink-950">
            {BRAND.name}.
          </span>
        </span>
      </div>
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(TransitionContext);
}

/** Drop-in <Link> that plays the page transition for internal navigation. */
export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const ctx = usePageTransition();
  return (
    <Link
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || !ctx) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!href.startsWith("/") || href.startsWith("/#")) return;
        e.preventDefault();
        ctx.navigate(href);
      }}
      {...props}
    />
  );
}
