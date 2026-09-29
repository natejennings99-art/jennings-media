"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/content/site";
import { buttonStyles } from "@/components/ui/button";
import { Logo } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 480 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return;
    createClient()
      .auth.getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,border-color,backdrop-filter] duration-500 ease-(--ease-expo)",
          scrolled ? "border-b border-white/[0.07] bg-ink-950/70 backdrop-blur-2xl" : "border-b border-transparent",
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6 sm:h-18">
          <Link href="/" className="relative z-10" aria-label="Jennings Media home" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 backdrop-blur-xl lg:flex" aria-label="Main">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-[13.5px] transition-colors duration-300",
                    active ? "bg-white/10 text-bone-50" : "text-mist-300 hover:text-bone-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={signedIn ? "/dashboard" : "/login"}
              className="hidden rounded-full px-4 py-2 text-[13.5px] text-mist-300 transition hover:text-bone-50 sm:inline-flex"
            >
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
            <Link href="/book" className={buttonStyles({ size: "sm", className: "hidden h-10 px-5 sm:inline-flex" })}>
              Book a Shoot
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative z-10 grid size-11 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-50 backdrop-blur lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-ink-950/95 backdrop-blur-2xl transition-[opacity,visibility] duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <nav className="container-page flex flex-1 flex-col justify-center gap-1 pt-20" aria-label="Mobile">
          {[...NAV_LINKS, { href: signedIn ? "/dashboard" : "/login", label: signedIn ? "Dashboard" : "Sign in" }].map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className={cn(
                "border-b border-white/[0.06] py-4 text-4xl font-medium tracking-[-0.04em] text-bone-50 transition-all duration-700 ease-(--ease-expo)",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="container-page pb-10">
          <Link href="/book" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className={buttonStyles({ size: "xl", className: "w-full" })}>
            Book a Shoot
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
      </div>
    </>
  );
}
