import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { BRAND, NAV } from "@/lib/brand";
import { TransitionLink } from "@/components/experience/transition";
import { RollText } from "./nav-link";

export function SiteFooter({ email, socials }: { email: string | null; socials: { label: string; href: string }[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950">
      <div className="gutter grid gap-12 pt-20 pb-16 sm:pt-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label text-mist-500">(Next) — Let&rsquo;s talk</p>
          <TransitionLink href="/contact" data-cursor="cta" className="group mt-6 inline-flex items-center gap-4 font-display text-[clamp(2.25rem,5vw,4.5rem)] text-bone-50">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_3px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-700 ease-(--ease-expo) group-hover:bg-[length:100%_3px]">
              Start a project
            </span>
            <ArrowUpRight className="size-[0.8em] text-accent-300 transition-transform duration-500 group-hover:rotate-45" strokeWidth={2.2} />
          </TransitionLink>
          {email && (
            <a href={`mailto:${email}`} className="mt-6 block text-lg text-mist-300 transition hover:text-bone-50">
              {email}
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="label mb-5 text-mist-500">Navigate</p>
            <ul className="space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <TransitionLink href={item.href} className="group text-[15px] text-mist-300 hover:text-bone-50">
                    <RollText>{item.label}</RollText>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-5 text-mist-500">Follow</p>
            <ul className="space-y-3">
              {socials.length ? (
                socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noreferrer" className="group text-[15px] text-mist-300 hover:text-bone-50">
                      <RollText>{s.label}</RollText>
                    </a>
                  </li>
                ))
              ) : (
                <li className="text-[15px] text-mist-600">Instagram · LinkedIn · TikTok</li>
              )}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="label mb-5 text-mist-500">Studio</p>
            <Link href="/locations/washington-dc" className="block text-[15px] text-mist-300 hover:text-bone-50">Washington, DC</Link>
            <Link href="/locations/tampa" className="block text-[15px] text-mist-300 hover:text-bone-50">Tampa, FL</Link>
            <p className="text-[15px] text-mist-500">{BRAND.locationNote}</p>
            <p className="label mt-8 mb-4 text-mist-500">Media production</p>
            <Link href="/pricing" className="group inline-flex items-center gap-1.5 text-[15px] text-mist-300 hover:text-bone-50">
              <RollText>Real estate media — book online</RollText>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/plans" className="group mt-3 flex items-center gap-1.5 text-[15px] text-mist-300 hover:text-bone-50">
              <RollText>Retainers & packages</RollText>
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/pay" className="group mt-3 flex items-center gap-1.5 text-[15px] text-mist-300 hover:text-bone-50">
              <RollText>Make a payment</RollText>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="gutter flex flex-col-reverse items-start justify-between gap-4 border-t border-white/[0.07] py-6 text-[13px] text-mist-500 sm:flex-row sm:items-center">
        <p>
          © {year} {BRAND.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-bone-50">Privacy</Link>
          <Link href="/terms" className="hover:text-bone-50">Terms</Link>
          <Link href="/login" className="hover:text-bone-50">Client login</Link>
          <a href="#top" className="grid size-9 place-items-center rounded-full border border-white/15 text-bone-50 transition hover:bg-bone-50 hover:text-ink-950" aria-label="Back to top">
            <ArrowUp className="size-4" />
          </a>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none -mb-[0.18em] overflow-hidden text-center font-display text-[10.2vw] leading-[0.8] whitespace-nowrap text-bone-50/[0.06] select-none">
        {BRAND.name}
      </div>
    </footer>
  );
}
