import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { LOCATIONS, findLocation, type Location } from "@/lib/content/seo";
import { getCatalog, getPortfolio } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { priceSummary } from "@/lib/pricing/summary";
import { formatMoney } from "@/lib/utils";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { CaseCard } from "@/components/agency/case-card";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema, localBusinessSchema } from "@/components/seo/json-ld";
import { RelatedReading } from "@/components/agency/related-reading";

export const revalidate = 300;

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ city: l.slug }));
}

/** Fills the "{price}" slot in a location description from the live catalog. */
const describe = (l: Location, line: string) => (line ? l.description.replace("{price}", line) : l.description.replace(/\s*\{price\}\.?/, "")).trim();

export async function generateMetadata({ params }: PageProps<"/locations/[city]">): Promise<Metadata> {
  const l = findLocation((await params).city);
  if (!l) return {};
  const description = describe(l, priceSummary(await getCatalog()).line);
  return { title: l.seoTitle, description, alternates: { canonical: `/locations/${l.slug}` }, openGraph: { title: l.seoTitle, description, url: `/locations/${l.slug}`, images: [{ url: "/opengraph-image" }] } };
}

/** The real estate services a city page sells, in the order agents usually ask about them. */
const RE_SLUGS = ["photography", "cinematic-video", "social-media-reel", "drone-photography", "floor-plans", "twilight-photography"];

export default async function LocationPage({ params }: PageProps<"/locations/[city]">) {
  const l = findLocation((await params).city);
  if (!l) notFound();
  const [projects, catalog] = await Promise.all([getPortfolio(), getCatalog()]);
  const price = priceSummary(catalog);
  const local = l.work.map((slug) => projects.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  const work = local.length ? local : projects.filter((p) => p.is_featured).slice(0, 2);
  const services = RE_SLUGS.map((slug) => catalog.services.find((s) => s.slug === slug && s.is_bookable)).filter((s) => s !== undefined);
  const fl = l.region === "FL";

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema(l, describe(l, price.line)),
          faqSchema(l.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: l.city, path: `/locations/${l.slug}` },
          ]),
        ]}
      />
      <PageIntro label={`Real estate media · ${l.city}`} title={<>{l.headline}</>} aside={<BookCtaRow />}>
        {price.line && <span className="block text-bone-50">{price.line}. Prices scale with home size.</span>}
        <span className="mt-2 block">Next-day photos, films in about 48 hours.</span>
      </PageIntro>

      <section className="gutter pb-16" aria-labelledby="local-title">
        <SectionLabel index="01" className="mb-8">Shooting in {l.short}</SectionLabel>
        <h2 id="local-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          Listings in {l.short}, <span className="text-accent-300">shot for how they sell.</span>
        </h2>
        <div className="mt-10 max-w-[68ch] space-y-5 text-[17px] leading-relaxed text-mist-300">
          <p>{l.intro}</p>
          {l.local.map((t) => (
            <p key={t.slice(0, 24)}>{t}</p>
          ))}
        </div>
        <h3 className="label mt-12 mb-5 text-mist-500">Where we work</h3>
        <ul className="flex flex-wrap gap-3">
          {l.areas.map((a) => (
            <li key={a} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[14px] text-mist-300">
              <MapPin className="size-3.5 text-accent-300" />
              {a}
            </li>
          ))}
        </ul>
      </section>

      {services.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="loc-services-title">
          <SectionLabel index="02" className="mb-8">Services &amp; prices</SectionLabel>
          <h2 id="loc-services-title" className="mb-10 font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            What we shoot in {l.short}
          </h2>
          <div className="grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <TransitionLink key={s.id} href={`/book?service=${s.slug}`} className="group flex flex-col justify-between gap-6 bg-ink-950 p-7 transition-colors hover:bg-ink-900">
                <span className="flex items-start justify-between gap-3 text-[20px] font-semibold tracking-tight text-bone-50">
                  {s.name}
                  <ArrowUpRight className="size-4 shrink-0 text-mist-500 transition-transform duration-500 group-hover:rotate-45 group-hover:text-accent-300" />
                </span>
                <span className="text-[14.5px] leading-relaxed text-mist-400">{s.tagline}</span>
                <span className="label text-accent-300">
                  From {formatMoney(startingPrice(s))}
                  {s.unit_label ? ` / ${s.unit_label}` : ""}
                </span>
              </TransitionLink>
            ))}
          </div>
          {price.packages.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {price.packages.map((p) => (
                <li key={p.id}>
                  <TransitionLink href={`/book?package=${p.slug}`} className="flex h-full flex-col gap-2 rounded-xl border border-white/10 px-5 py-4 hover:border-accent-300">
                    <span className="text-[17px] font-semibold text-bone-50">
                      {p.name} <span className="text-mist-400">from {formatMoney(startingPrice(p))}</span>
                    </span>
                    <span className="text-[14px] leading-snug text-mist-400">{p.tagline}</span>
                  </TransitionLink>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
            <TransitionLink href="/pricing" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Full price list</TransitionLink>
            {" · "}
            <TransitionLink href="/real-estate" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Real estate photo &amp; video</TransitionLink>
            {fl && (
              <>
                {" · "}
                <TransitionLink href="/listing-video-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Listing video</TransitionLink>
                {" · "}
                <TransitionLink href="/drone-real-estate-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Drone &amp; airspace</TransitionLink>
                {" · "}
                <TransitionLink href="/real-estate-photography-cost-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">What it costs</TransitionLink>
              </>
            )}
          </p>
        </section>
      )}

      <section className="gutter py-16 sm:py-24" aria-labelledby="market-title">
        <SectionLabel index="03" className="mb-8">The {l.short} market</SectionLabel>
        <h2 id="market-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          Selling in {l.short}.
        </h2>
        <ul className="mt-10 max-w-[68ch] space-y-4">
          {l.market.map((t) => (
            <li key={t.slice(0, 24)} className="flex gap-3 text-[17px] leading-relaxed text-mist-300">
              <Check className="mt-1.5 size-4 shrink-0 text-accent-300" /> {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="gutter py-16 sm:py-24" aria-labelledby="loc-faq-title">
        <SectionLabel index="04" className="mb-8">Questions</SectionLabel>
        <h2 id="loc-faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          {l.short} FAQ
        </h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {l.faqs.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-tight text-bone-50 marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-accent-300 transition-transform duration-500 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-mist-300">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10">
          <BookCtaRow />
        </div>
      </section>

      {work.length > 0 && (
        <section className="py-16 sm:py-24" aria-labelledby="loc-work-title">
          <h2 id="loc-work-title" className="gutter mb-10">
            <SectionLabel>{local.length ? `Recent work around ${l.short}` : "Recent work"}</SectionLabel>
          </h2>
          <div className="gutter grid gap-10 md:grid-cols-2">
            {work.slice(0, 4).map((p) => (
              <CaseCard key={p.id} project={p} layout="grid" />
            ))}
          </div>
        </section>
      )}

      <section className="gutter pb-16" aria-labelledby="loc-business-title">
        <h2 id="loc-business-title" className="label mb-4 text-mist-500">For {l.short} businesses</h2>
        <p className="max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
          Not selling a home? We also shoot content and run marketing for local businesses: social media, Meta &amp; Google Ads, lead generation and websites.{" "}
          <TransitionLink href="/services" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">See marketing services</TransitionLink> or{" "}
          <TransitionLink href="/plans" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">monthly plans</TransitionLink>.
        </p>
      </section>

      <section className="gutter pb-16" aria-label="Nearby areas we serve">
        <p className="label mb-4 text-mist-500">Also serving</p>
        <div className="flex flex-wrap gap-3">
          {LOCATIONS.filter((o) => o.slug !== l.slug && o.region === l.region).map((o) => (
            <TransitionLink key={o.slug} href={`/locations/${o.slug}`} className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] text-bone-50 hover:border-accent-300">
              <MapPin className="size-4 text-accent-300" />
              {o.city}
            </TransitionLink>
          ))}
        </div>
      </section>
      <RelatedReading slugs={fl ? ["tampa-listing-media-guide", "tampa-small-business-ads", "ai-lead-follow-up-tampa"] : ["the-first-three-seconds", "fewer-campaigns-more-systems"]} title={fl ? "Guides for Tampa Bay agents" : "Further reading"} />
      <FinalCta title={`Listing in ${l.short}?`} kicker="Book your shoot." />
    </>
  );
}
