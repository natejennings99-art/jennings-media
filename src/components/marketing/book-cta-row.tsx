import type { ReactNode } from "react";
import { ArrowUpRight, MessageSquare, Phone } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { TransitionLink } from "@/components/experience/transition";

const smsHref = BRAND.phoneHref.replace(/^tel:/, "sms:");

/** Above-the-fold booking row for real estate landing pages: Book a shoot, plus one-tap call and text. */
export function BookCtaRow({ href = "/book", label = "Book a shoot" }: { href?: string; label?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <TransitionLink
        href={href}
        data-cursor="cta"
        className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
      >
        {label}
        <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </TransitionLink>
      <a href={BRAND.phoneHref} className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
        <Phone className="size-4" aria-hidden /> Call {BRAND.phone}
      </a>
      <a href={smsHref} className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
        <MessageSquare className="size-4" aria-hidden /> Text us
      </a>
    </div>
  );
}

/** Small "from" price line shown under a hero. */
export function PriceLine({ children }: { children: ReactNode }) {
  return <p className="label mt-5 text-accent-300">{children}</p>;
}
