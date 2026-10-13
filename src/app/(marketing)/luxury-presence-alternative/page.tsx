import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { getCatalog } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { COMPARE_FAQ, COMPARE_ROWS } from "@/lib/content/compare";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury Presence Alternative in Tampa",
  description:
    "Comparing Luxury Presence with Jennings Media? They sell marketing software; we shoot your listings. Published prices, no contract, Tampa Bay and DC.",
  alternates: { canonical: "/luxury-presence-alternative" },
};

export default async function LuxuryPresenceAlternativePage() {
  const catalog = await getCatalog();
  const cheapest = catalog.services?.length
    ? Math.min(...catalog.services.map((s) => startingPrice(s)).filter((n) => n > 0))
    : null;

  return (
    <>
      <JsonLd
        data={[
          faqSchema(COMPARE_FAQ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Luxury Presence alternative", path: "/luxury-presence-alternative" },
          ]),
        ]}
      />

      <section className="gutter pt-32 pb-16">
        <SectionLabel index="01" className="mb-8">Honest comparison</SectionLabel>
        <h1 className="max-w-[18ch] font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]">
          We are not really a Luxury Presence competitor.
        </h1>
        <p className="mt-8 max-w-[62ch] text-[18px] leading-relaxed text-mist-300">
          People search for this comparison, so here is the straight answer rather
          than a feature table designed to make us win. <strong>Luxury Presence sells
          software</strong> — a website, a CRM, AI tools and managed advertising.{" "}
          <strong>{BRAND.name} is a production studio</strong> — we turn up at your
          listing and shoot it.
        </p>
        <p className="mt-5 max-w-[62ch] text-[18px] leading-relaxed text-mist-300">
          Those are different jobs. A lot of agents use a platform for their website
          and someone local for the photography, and that is a perfectly sensible
          way to do it.
        </p>
      </section>

      <section className="gutter py-16">
        <SectionLabel index="02" className="mb-8">Side by side</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-mist-700/40">
                <th className="px-4 py-3.5 text-[13px] uppercase tracking-wide text-mist-400"> </th>
                <th className="px-4 py-3.5 text-[13px] uppercase tracking-wide text-mist-400">Luxury Presence</th>
                <th className="px-4 py-3.5 text-[13px] uppercase tracking-wide text-accent-300">{BRAND.name}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r) => (
                <tr key={r.label} className="border-b border-mist-700/20">
                  <td className="px-4 py-3.5 text-[15px] text-bone-50">{r.label}</td>
                  <td className="px-4 py-3.5 text-[14px] text-mist-300">{r.lp}</td>
                  <td className="px-4 py-3.5 text-[14px] text-bone-50">{r.jm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-[62ch] text-[14px] leading-relaxed text-mist-400">
          Everything in the Luxury Presence column comes from their own public site.
          We have not guessed at their pricing because they do not publish it.
        </p>
      </section>

      <section className="gutter py-16">
        <SectionLabel index="03" className="mb-8">When to pick them</SectionLabel>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-[26px] text-bone-50">Choose a platform if…</h2>
            <ul className="mt-5 space-y-3 text-[16px] leading-relaxed text-mist-300">
              <li className="flex gap-3"><Minus className="mt-1 size-4 shrink-0 text-mist-500" />You need a branded website and a CRM, not a photographer.</li>
              <li className="flex gap-3"><Minus className="mt-1 size-4 shrink-0 text-mist-500" />You want advertising run for you on an ongoing retainer.</li>
              <li className="flex gap-3"><Minus className="mt-1 size-4 shrink-0 text-mist-500" />You are building a long-term brand presence rather than selling one listing.</li>
            </ul>
            <p className="mt-5 text-[15px] text-mist-400">
              If that is you, a platform is the right shape of thing and we would say so.
            </p>
          </div>
          <div>
            <h2 className="font-display text-[26px] text-accent-300">Choose us if…</h2>
            <ul className="mt-5 space-y-3 text-[16px] leading-relaxed text-mist-300">
              <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-accent-300" />You have a listing this week that needs photographing and filming.</li>
              <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-accent-300" />You want to see a price and book without sitting through a demo.</li>
              <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-accent-300" />You would rather not sign up to anything monthly.</li>
              <li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-accent-300" />You want someone local who can be at the property.</li>
            </ul>
            {cheapest ? (
              <p className="mt-5 text-[15px] text-mist-300">
                Services start at <strong className="text-bone-50">{formatMoney(cheapest)}</strong>.{" "}
                <TransitionLink href="/pricing" className="underline underline-offset-4">See the full price list</TransitionLink>.
              </p>
            ) : (
              <p className="mt-5 text-[15px] text-mist-300">
                <TransitionLink href="/pricing" className="underline underline-offset-4">See the full price list</TransitionLink>.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="gutter py-16">
        <SectionLabel index="04" className="mb-8">Questions</SectionLabel>
        <div className="max-w-[72ch] space-y-6">
          {COMPARE_FAQ.map((f) => (
            <details key={f.q} className="border-b border-mist-700/30 pb-5">
              <summary className="cursor-pointer text-[18px] text-bone-50">{f.q}</summary>
              <p className="mt-3 text-[16px] leading-relaxed text-mist-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <FinalCta title="Got a listing to shoot?" kicker="No demo required." />
    </>
  );
}
