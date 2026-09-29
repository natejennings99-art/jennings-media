"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { NAV, BRAND } from "@/lib/brand";
import { Logo } from "@/components/ui/misc";
import { TransitionLink } from "@/components/experience/transition";
import { Magnetic } from "@/components/experience/magnetic";
import { RollText } from "./nav-link";
import { cn } from "@/lib/utils";

export function SiteHeader({ email, socials }: { email: string | null; socials: { label: string; href: string }[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = window.__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          "gutter fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled && !open ? "border-b border-white/[0.06] bg-ink-950/65 backdrop-blur-xl" : "border-b border-transparent"
        )}
      >
        <div className={cn("flex items-center justify-between gap-6 transition-[height] duration-500 ease-(--ease-expo)", scrolled ? "h-16" : "h-20 sm:h-24")}>
          <TransitionLink href="/" aria-label={`${BRAND.name} — home`} className="relative z-10" onClick={close}>
            <Logo />
          </TransitionLink>

          <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <TransitionLink key={item.href} href={item.href} className={cn("group text-[14px] font-medium tracking-[-0.01em] transition-colors", active ? "text-bone-50" : "text-mist-300 hover:text-bone-50")}>
                  <RollText>{item.label}</RollText>
                  <span className={cn("mx-auto mt-1 block h-px bg-accent-300 transition-[width] duration-500", active ? "w-full" : "w-0")} />
                </TransitionLink>
              );
            })}
            <Magnetic>
              <TransitionLink
                href="/contact"
                data-cursor="cta"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-bone-50 px-5 text-[13px] font-semibold tracking-[0.02em] text-ink-950 uppercase transition-colors hover:bg-accent-300"
              >
                <RollText>Start a project</RollText>
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
              </TransitionLink>
            </Magnetic>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-10 grid size-12 place-items-center rounded-full bg-bone-50 text-ink-950 lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span className={cn("absolute left-0 h-[2px] w-full bg-current transition-all duration-500 ease-(--ease-expo)", open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0")} />
              <span className={cn("absolute left-0 h-[2px] w-full bg-current transition-all duration-500 ease-(--ease-expo)", open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0")} />
            </span>
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ink-950 transition-[clip-path] duration-700 ease-(--ease-expo) lg:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        )}
        aria-hidden={!open}
      >
        <nav className="gutter flex flex-1 flex-col justify-center pt-24" aria-label="Mobile">
          {NAV.map((item, i) => (
            <div key={item.href} className="overflow-hidden border-b border-white/[0.07]">
              <TransitionLink
                href={item.href}
                onClick={close}
                tabIndex={open ? 0 : -1}
                className={cn("flex items-baseline justify-between py-3 font-display text-[clamp(2.75rem,14vw,5rem)] text-bone-50 transition-transform duration-700 ease-(--ease-expo)", open ? "translate-y-0" : "translate-y-full")}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                {item.label}
                <span className="font-mono text-xs tracking-normal text-mist-500">0{i + 1}</span>
              </TransitionLink>
            </div>
          ))}
        </nav>
        <div className={cn("gutter pb-10 transition-opacity delay-300 duration-500", open ? "opacity-100" : "opacity-0")}>
          <TransitionLink href="/contact" onClick={close} tabIndex={open ? 0 : -1} className="flex h-15 items-center justify-between rounded-full bg-accent-300 px-7 text-[15px] font-semibold tracking-wide text-ink-950 uppercase">
            Start a project <ArrowUpRight className="size-5" />
          </TransitionLink>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-400">
            {email && <a href={`mailto:${email}`}>{email}</a>}
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
            <span>{BRAND.location}</span>
          </div>
        </div>
      </div>
    </>
  );
}
