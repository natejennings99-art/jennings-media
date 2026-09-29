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
  const pending = useRef<string | null>(null);
  const busy = useRef(false);

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
      pending.current = target.pathname;
      router.prefetch(href);
      gsap
        .timeline({ onComplete: () => router.push(href) })
        .set(panel.current, { display: "flex", yPercent: 100 })
        .to(panel.current, { yPercent: 0, duration: 0.5, ease: "power4.inOut" })
        .fromTo(word.current, { yPercent: 120 }, { yPercent: 0, duration: 0.4, ease: "power3.out" }, "-=0.25");
    },
    [router]
  );

  useEffect(() => {
    if (!pending.current || pending.current !== pathname || !panel.current) return;
    pending.current = null;
    scrollToTop();
    gsap
      .timeline({
        delay: 0.08,
        onComplete: () => {
          gsap.set(panel.current, { display: "none" });
          busy.current = false;
          ScrollTrigger.refresh();
        },
      })
      .to(word.current, { yPercent: -120, duration: 0.3, ease: "power3.in" })
      .to(panel.current, { yPercent: -100, duration: 0.55, ease: "power4.inOut" }, "-=0.1");
  }, [pathname]);

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
