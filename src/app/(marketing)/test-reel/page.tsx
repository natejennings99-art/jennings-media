import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { findPlan, formatPlanPrice } from "@/lib/content/plans";
import { TEST_REEL_AUDIENCE, TEST_REEL_INCLUDES, TEST_REEL_STEPS } from "@/lib/content/test-reel";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { TestReelForm } from "@/components/agency/test-reel-form";
import { TikTokLink, VerticalSamples } from "@/components/agency/test-reel-offer";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Free Test Reel for DC & Miami Venues",
  description: "Rooftop bars, boutique hotels, yacht charters, lounges and spas in DC metro and Miami: get a free 15-second vertical reel of your space, delivered in 48 hours.",
  alternates: { canonical: "/test-reel" },
};

export default function TestReelPage() {
  const starter = findPlan("starter");
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Free test reel", path: "/test-reel" }])} />
      <PageIntro
        label="Free test reel · DC metro & Miami"
        title={
          <>
            Your space,
            <br />
            in <span className="text-accent-300">fifteen</span>
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
        We&rsquo;ll film one free 15-second vertical reel of your venue at golden hour or after dark, and deliver it within 48 hours. If you like it, post it. If you want more like it every month, we can talk.
      </PageIntro>

      <section className="gutter grid gap-14 pb-24 lg:grid-cols-12 lg:gap-10" aria-labelledby="for-title">
        <div className="lg:col-span-7">
          <SectionLabel index="01" className="mb-6">
            Who it&rsquo;s for
          </SectionLabel>
          <h2 id="for-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Places people go to be seen.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-2">
            {TEST_REEL_AUDIENCE.map((a) => (
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
            {TEST_REEL_INCLUDES.map((f) => (
              <li key={f} className="flex gap-3 text-[16px] leading-snug text-mist-300">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <VerticalSamples />
          <p className="mt-6 text-[15px] leading-relaxed text-mist-400">A few vertical cuts from our own shoots. Rooftops, boats, pool parties and sunsets live on TikTok:</p>
          <TikTokLink className="mt-4" />
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
          {TEST_REEL_STEPS.map((s, i) => (
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
            Two minutes. One evening. Fifteen seconds.
          </h2>
          <TestReelForm />
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
              <a href={`mailto:${BRAND.email}?subject=${encodeURIComponent("Free test reel")}`} className="text-lg break-all text-bone-50 hover:text-accent-300">
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

      {starter && (
        <section className="gutter pb-32" aria-labelledby="after-title">
          <div className="grid gap-10 rounded-lg border border-white/10 bg-white/[0.02] p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <SectionLabel className="mb-5">After the test reel</SectionLabel>
              <h2 id="after-title" className="font-display text-[clamp(2rem,4vw,3.25rem)] text-bone-50">
                Want this every month?
              </h2>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-mist-400">
                The test reel is free with no strings. If you&rsquo;d like content like it all month, our {starter.name} plan is {formatPlanPrice(starter)} a month — {starter.tagline.toLowerCase()}
              </p>
              <TransitionLink href="/plans" className="group mt-8 inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
                See all plans
                <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
              </TransitionLink>
            </div>
            <div className="lg:col-span-5">
              <p className="flex items-baseline gap-2">
                <span className="font-display text-[1.75rem] text-bone-50">{starter.name}</span>
                <span className="font-display text-[1.75rem] text-accent-300">{formatPlanPrice(starter)}</span>
                <span className="label text-mist-500">/ month</span>
              </p>
              <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                {starter.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
