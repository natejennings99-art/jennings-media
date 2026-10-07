import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { LISTING_REEL_INCLUDES, LISTING_REEL_STEPS, LISTING_REEL_WHY } from "@/lib/content/listing-reel";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { ListingReelForm } from "@/components/agency/listing-reel-form";
import { ListingReelSamples } from "@/components/agency/listing-reel-samples";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Free Listing Reel for Tampa Bay Agents",
  description: "Tampa, St. Pete and Clearwater agents: get a free 30-second vertical reel of your next listing, delivered within 48 hours. One per agent, no contract.",
  alternates: { canonical: "/free-listing-reel" },
};

export default function FreeListingReelPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Real estate", path: "/real-estate" }, { name: "Free listing reel", path: "/free-listing-reel" }])} />
      <PageIntro
        label="Free for agents · Tampa Bay"
        title={
          <>
            Your next listing,
            <br />
            in <span className="text-accent-300">thirty</span>
            <br />
            seconds.
          </>
        }
        aside={
          <a href="#claim" className="group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50">
            Claim your free reel
            <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
          </a>
        }
      >
        Tampa, St. Pete and Clearwater agents: we&rsquo;ll film one free 30-second vertical reel of your next listing and deliver it within 48 hours. Post it, tag the home, show your sellers. If you like it, book photos and video for the rest.
      </PageIntro>

      <section className="gutter grid gap-14 pb-24 lg:grid-cols-12 lg:gap-10" aria-labelledby="why-title">
        <div className="lg:col-span-7">
          <SectionLabel index="01" className="mb-6">
            Why a reel
          </SectionLabel>
          <h2 id="why-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Photos get swiped. Video gets watched.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {LISTING_REEL_WHY.map((a) => (
              <li key={a.title}>
                <p className="text-[18px] font-semibold tracking-tight text-bone-50">{a.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{a.body}</p>
              </li>
            ))}
          </ul>

          <SectionLabel index="02" className="mt-20 mb-6">
            What you get
          </SectionLabel>
          <ul className="space-y-4">
            {LISTING_REEL_INCLUDES.map((f) => (
              <li key={f} className="flex gap-3 text-[16px] leading-snug text-mist-300">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <ListingReelSamples />
          <p className="mt-6 text-[15px] leading-relaxed text-mist-400">Three of our own listing reels. More films, photos and drone work on the real estate page.</p>
          <TransitionLink href="/real-estate" className="group mt-4 inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
            See real estate work
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </TransitionLink>
        </div>
      </section>

      <section className="gutter pb-24" aria-labelledby="how-title">
        <SectionLabel index="03" className="mb-6">
          How it works
        </SectionLabel>
        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {LISTING_REEL_STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="claim" className="gutter grid scroll-mt-28 gap-16 pb-24 lg:grid-cols-12" aria-labelledby="claim-title">
        <div className="lg:col-span-8">
          <SectionLabel index="04" className="mb-6">
            Claim your reel
          </SectionLabel>
          <h2 id="claim-title" className="mb-12 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            One listing. One visit. Thirty seconds.
          </h2>
          <ListingReelForm />
        </div>
        <aside className="space-y-12 lg:col-span-3 lg:col-start-10 lg:pt-40">
          <div>
            <SectionLabel className="mb-4">Rather text?</SectionLabel>
            <a href={BRAND.phoneHref.replace(/^tel:/, "sms:")} className="text-lg text-bone-50 hover:text-accent-300">
              {BRAND.phone}
            </a>
          </div>
          {BRAND.email && (
            <div>
              <SectionLabel className="mb-4">Email</SectionLabel>
              <a href={`mailto:${BRAND.email}?subject=${encodeURIComponent("Free listing reel")}`} className="text-lg break-all text-bone-50 hover:text-accent-300">
                {BRAND.email}
              </a>
            </div>
          )}
          <div>
            <SectionLabel className="mb-4">Instagram</SectionLabel>
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-lg text-bone-50 hover:text-accent-300">
              {BRAND.instagramHandle}
            </a>
          </div>
        </aside>
      </section>

      <section className="gutter pb-32" aria-labelledby="after-title">
        <div className="grid gap-10 rounded-lg border border-white/10 bg-white/[0.02] p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <SectionLabel className="mb-5">After the free reel</SectionLabel>
            <h2 id="after-title" className="font-display text-[clamp(2rem,4vw,3.25rem)] text-bone-50">
              Listing packages from $450.
            </h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-mist-400">The reel is free with no strings. Our most-booked package — ground and aerial photos, a floor plan and a property website — starts at $450, with cinematic film and 3D tours as add-ons. Book online in two minutes.</p>
          </div>
          <div className="flex flex-wrap gap-6 lg:col-span-4 lg:justify-end">
            <TransitionLink href="/pricing" className="group inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
              See packages
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
            <TransitionLink href="/book" className="group inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
              Book a shoot
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
          </div>
        </div>
      </section>
    </>
  );
}
