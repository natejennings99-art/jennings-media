import { ArrowUpRight, Check } from "lucide-react";
import { CONTENT_TIERS, CORE_SERVICES, PRICE_PLACEHOLDER, showPlaceholders, tierPriceLabel } from "@/lib/content/offers";
import { CALL } from "@/lib/content/call";
import { TransitionLink } from "@/components/experience/transition";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

/**
 * Photo, video, social content — what each one is, then the three packages.
 * Prices come from plans.ts through offers.ts; a tier without one shows "[PRICE]" while you
 * work on the site and "Quoted on your call" on the live site.
 */
export function ContentPackages({ index }: { index?: string }) {
  const placeholders = showPlaceholders();
  return (
    <section id="packages" className="gutter scroll-mt-28 pb-24 sm:pb-32" aria-labelledby="packages-title">
      <SectionLabel index={index} className="mb-6">
        Photo, video, social content
      </SectionLabel>
      <h2 id="packages-title" className="max-w-[18ch] font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
        What we make, and three ways to get it.
      </h2>

      <ul className="mt-10 grid gap-x-10 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-3">
        {CORE_SERVICES.map((s) => (
          <li key={s.slug}>
            <h3 className="text-[20px] font-semibold tracking-tight text-bone-50">{s.title}</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed text-mist-300">{s.body}</p>
            <ul className="mt-4 space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex gap-3 text-[14.5px] leading-snug text-mist-400">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {CONTENT_TIERS.map((t) => {
          const price = tierPriceLabel(t, placeholders);
          const unset = t.price == null;
          return (
            <article key={t.slug} className={cn("relative flex flex-col rounded-lg border p-7 sm:p-8", t.recommended ? "border-accent-300/60 bg-accent-300/[0.06]" : "border-white/10 bg-white/[0.02]")}>
              {t.recommended && <span className="label absolute -top-3 left-7 rounded-full bg-accent-300 px-3 py-1 text-ink-950">Good place to start</span>}
              <h3 className="font-display text-[1.75rem] text-bone-50">{t.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400 lg:min-h-12">{t.tagline}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={cn("font-display text-bone-50", unset && !placeholders ? "text-[1.6rem]" : "text-[clamp(2.5rem,4vw,3.25rem)]", price === PRICE_PLACEHOLDER && "text-accent-300")}>{price}</span>
                {(!unset || placeholders) && <span className="label text-mist-500">{t.per === "month" ? "/ month" : "/ shoot"}</span>}
              </p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                  </li>
                ))}
              </ul>
              <TransitionLink
                href={t.href}
                data-cursor="cta"
                className={cn(
                  "group mt-8 inline-flex h-13 items-center justify-between rounded-full pr-1.5 pl-6 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors",
                  t.recommended ? "bg-accent-300 text-ink-950 hover:bg-bone-50" : "bg-bone-50 text-ink-950 hover:bg-accent-300"
                )}
              >
                {t.cta}
                <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </TransitionLink>
            </article>
          );
        })}
      </div>
      <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-mist-400">
        Not sure which one fits?{" "}
        <TransitionLink href={CALL.path} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
          Book a free 15-minute call
        </TransitionLink>{" "}
        and we&rsquo;ll help you pick. Ads, if you ever want them, are separate.
      </p>
    </section>
  );
}
