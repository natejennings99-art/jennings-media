import type { Metadata } from "next";
import Link from "next/link";
import { Lock, X } from "lucide-react";
import { Logo } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Book a Shoot",
  description: "Book real estate photography, video, drone, floor plans and 3D tours online in minutes with instant pricing.",
  alternates: { canonical: "/book" },
};

export default function BookLayout({ children }: LayoutProps<"/book">) {
  return (
    <div className="min-h-dvh">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-2xl">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" aria-label="Jennings Media home">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-[12.5px] text-mist-400 sm:flex">
              <Lock className="size-3.5 text-emerald-300" /> Secure booking
            </span>
            <Link href="/" className="grid size-10 place-items-center rounded-full border border-white/10 text-mist-300 transition hover:text-bone-50" aria-label="Exit booking">
              <X className="size-4" />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
