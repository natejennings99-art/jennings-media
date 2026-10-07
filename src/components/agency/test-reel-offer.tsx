import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { TEST_REEL_INCLUDES, TEST_REEL_SAMPLES } from "@/lib/content/test-reel";
import { TiktokIcon } from "@/components/ui/brand-icons";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { Magnetic } from "@/components/experience/magnetic";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

/** Three of our own vertical reels, looping while on screen. */
export function VerticalSamples({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3 sm:gap-4", className)}>
      {TEST_REEL_SAMPLES.map((r, i) => (
        <figure key={r.slug} className={cn("relative aspect-[9/16] overflow-hidden rounded-xl bg-ink-900", i === 1 && "sm:-translate-y-8")}>
          <Image src={`/media/video/${r.slug}.jpg`} alt={`${r.label} — ${r.kind}`} fill sizes="(min-width:1024px) 14vw, 30vw" className="object-cover" />
          <AmbientVideo src={`/media/video/${r.slug}.mp4`} threshold={0.4} className="absolute inset-0 size-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-3 bottom-3">
            <p className="label hidden text-accent-300 sm:block">{r.kind}</p>
            <p className="sm:mt-1 text-[13px] leading-tight font-semibold tracking-tight text-bone-50 sm:text-[15px]">{r.label}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function TikTokLink({ className }: { className?: string }) {
  return (
    <a href={BRAND.tiktok} target="_blank" rel="noreferrer" className={cn("group inline-flex items-center gap-3 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase", className)}>
      <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-accent-300 group-hover:bg-accent-300 group-hover:text-ink-950">
        <TiktokIcon className="size-4" />
      </span>
      {BRAND.tiktokHandle}
      <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
    </a>
  );
}

/** Homepage offer for venues: a free 15-second test reel. Full details live on /test-reel. */
export function TestReelOffer() {
  return (
    <section id="test-reel" className="gutter py-24 sm:py-32" aria-labelledby="test-reel-title">
      <div className="grid gap-14 rounded-2xl border border-accent-300/30 bg-accent-300/[0.05] p-6 sm:p-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:p-14">
        <div className="lg:col-span-7">
          <SectionLabel className="mb-8">Free for venues · DC metro &amp; Miami</SectionLabel>
          <SplitReveal as="h2" id="test-reel-title" className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] text-bone-50">
            Your space,
            <br />
            in <span className="text-accent-300">fifteen seconds.</span>
          </SplitReveal>
          <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-mist-300">
            Rooftop bars, boutique hotels, yacht charters, lounges and spas: we&rsquo;ll film a free 15-second vertical reel of your space — so you can see what we&rsquo;d make before you spend a dollar.
          </p>
          <ul className="mt-8 space-y-3">
            {TEST_REEL_INCLUDES.map((f) => (
              <li key={f} className="flex gap-3 text-[15.5px] leading-snug text-mist-300">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Magnetic>
              <TransitionLink
                href="/test-reel"
                data-cursor="cta"
                className="group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
              >
                Claim your free reel
                <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" />
                </span>
              </TransitionLink>
            </Magnetic>
            <TikTokLink />
          </div>
        </div>
        <VerticalSamples className="lg:col-span-5" />
      </div>
    </section>
  );
}
