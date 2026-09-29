"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { LogOut, Plus } from "lucide-react";
import { Logo, Avatar } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

/** Shared app shell for the client dashboard and admin. */
export function AppShell({
  nav,
  user,
  children,
  area,
  topAction,
}: {
  nav: NavItem[];
  user: { name: string; email: string };
  children: ReactNode;
  area: "client" | "admin";
  topAction?: ReactNode;
}) {
  const pathname = usePathname();
  const root = area === "admin" ? "/admin" : "/dashboard";
  const isActive = (href: string) => (href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/[0.07] bg-ink-900/60 px-4 py-5 lg:flex">
        <Link href="/" className="px-2" aria-label="Jennings Media home">
          <Logo />
        </Link>
        <p className="mt-6 mb-2 px-3 font-mono text-[10px] tracking-[0.2em] text-mist-600 uppercase">{area === "admin" ? "Studio admin" : "Client portal"}</p>
        <nav className="flex-1 space-y-0.5 overflow-y-auto" aria-label={area === "admin" ? "Admin" : "Dashboard"}>
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] transition-colors",
                  active ? "bg-white/[0.08] text-bone-50" : "text-mist-400 hover:bg-white/[0.04] hover:text-bone-100"
                )}
              >
                <item.icon className={cn("size-4.5", active ? "text-gold-200" : "text-mist-500 group-hover:text-mist-300")} strokeWidth={1.7} />
                <span className="flex-1">{item.label}</span>
                {item.badge ? <span className="rounded-full bg-gold-300 px-1.5 text-[10.5px] font-medium text-ink-950">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.07] p-3">
          <Avatar name={user.name || user.email} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-bone-100">{user.name || "Account"}</p>
            <p className="truncate text-[11.5px] text-mist-500">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="grid size-8 place-items-center rounded-lg text-mist-500 transition hover:bg-white/10 hover:text-bone-50" aria-label="Sign out">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-2xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <Link href="/" className="lg:hidden" aria-label="Home">
              <Logo compact />
            </Link>
            <div className="hidden text-sm text-mist-400 lg:block">{area === "admin" ? "Jennings Media Studio" : `Welcome back${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}</div>
            <div className="flex items-center gap-2">
              {topAction ?? (
                <Link href="/book" className={buttonStyles({ size: "sm" })}>
                  <Plus className="size-4" /> Book a shoot
                </Link>
              )}
              <form action="/auth/signout" method="post" className="lg:hidden">
                <button type="submit" className="grid size-9 place-items-center rounded-full border border-white/10 text-mist-400" aria-label="Sign out">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2.5 lg:hidden" aria-label="Sections">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px]",
                  isActive(item.href) ? "bg-bone-50 text-ink-950" : "text-mist-400"
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-medium tracking-[-0.04em] text-bone-50 sm:text-[2.4rem]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-mist-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
