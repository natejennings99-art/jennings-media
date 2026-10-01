import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Check, Minus } from "lucide-react";
import { getCatalog } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney, cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { CINEMATIC_FILMS, LISTING_REELS, RE_AREAS, RE_FAQ, RE_STEPS } from "@/lib/content/real-estate";
import { RE_PHOTOS } from "@/lib/content/photos";
import { PhotoGallery } from "@/components/agency/photo-gallery";
import { FilmGrid, ReelRail } from "@/components/agency/film-wall";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { ServiceIcon } from "@/components/ui/icon";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { RelatedReading } from "@/components/agency/related-reading";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Real Estate Photography & Video in Tampa Bay",
  description: "Listing photography, cinematic video, drone, 3D tours and floor plans for agents and brokerages in Tampa Bay and Washington, DC. See the work and book online.",
  alternates: { canonical: "/real-estate" },
  openGraph: { images: [{ url: "/media/photos/craftsman-exterior.jpg" }] },
};

const PACKAGE_IMAGE: Record<string, string> = {
  essential: "/media/work/kagera-living.jpg",
  pro: "/media/video/arlington-dining.jpg",
  signature: "/media/video/tunlaw-terrace.jpg",
};

const JUMP = [
  ["packages", "Packages"],
  ["services", "Services"],
  ["films", "Films"],
  ["photos", "Photos"],
  ["aerial", "Aerial"],
  ["process", "How it works"],
  ["faq", "FAQ"],
] as const;

export default async function RealEstatePage() {
  const catalog = await getCatalog();
  const services = catalog.services.filter((s) => s.is_bookable);
  const packages = [...catalog.packages].filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}/real-estate#service`,
    name: "Real estate photography, video & drone",
    serviceType: "Real estate media",
    description: "Listing photography, cinematic property video, drone aerials, 3D tours, floor plans and social reels.",
    url: `${env.siteUrl}/real-estate`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: RE_AREAS.map((name) => ({ "@type": "Place", name })),
    offers: packages.map((p) => ({ "@type": "Offer", name: `${p.name} package`, price: p.base_price_cents / 100, priceCurrency: "USD", url: `${env.siteUrl}/book?package=${p.slug}` })),
  };

  return (
    <>
      <JsonLd data={[serviceLd, faqSchema(RE_FAQ), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Real estate", path: "/real-estate" }])]} />

      {/* ───────────── Hero ───────────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden" aria-label="Real estate media">
        <div className="absolute inset-0 -z-10 bg-ink-950">
          <video className="absolute inset-0 size-full object-cover opacity-70" poster="/media/video/great-falls.jpg" autoPlay muted loop playsInline>
            <source media="(max-width: 767px)" src="/media/video/great-falls-mobile.mp4" type="video/mp4" />
            <source src="/media/video/great-falls.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/10 to-ink-950" />
        </div>
        <div className="gutter pt-40 pb-12 sm:pb-16">
          <p className="label mb-8 animate-fade-in text-accent-300">Real estate media · Tampa Bay · Washington, DC</p>
          <SplitReveal as="h1" immediate className="font-display text-hero text-bone-50">
            Listings that
            <br />
            <span className="text-accent-300">sell themselves.</span>
          </SplitReveal>
          <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
            <p className="max-w-lg animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:700ms] lg:col-span-6">
              Photography, cinematic video, drone, 3D tours and floor plans — shot in 4K, edited in-house and delivered ready for the MLS, your website and social.
            </p>
            <div className="flex animate-fade-up flex-wrap items-center gap-4 [animation-delay:850ms] lg:col-span-6 lg:justify-end">
              <TransitionLink
                href="/book"
                data-cursor="cta"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
              >
                Book a shoot
                <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </TransitionLink>
              <a href="#packages" className="group inline-flex h-14 items-center gap-2 px-3 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase">
                <span className="border-b border-current pb-1">Compare packages</span>
                <ArrowDownRight className="size-4 transition-transform duration-500 group-hover:-rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Jump nav ───────────── */}
      <nav aria-label="On this page" className="sticky top-16 z-30 border-y border-white/10 bg-ink-950/80 backdrop-blur-xl">
        <ul className="gutter flex gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {JUMP.map(([id, label]) => (
            <li key={id} className="shrink-0">
              <a href={`#${id}`} className="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold tracking-[0.06em] text-mist-400 uppercase transition-colors hover:bg-white/10 hover:text-bone-50">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ───────────── Packages ───────────── */}
      <section id="packages" className="gutter scroll-mt-32 py-24 sm:py-36" aria-labelledby="packages-title">
        <SectionLabel index="01" className="mb-8">Packages</SectionLabel>
        <SplitReveal as="h2" id="packages-title" className="font-display text-section text-bone-50">
          Pick a package.
          <br />
          <span className="text-accent-300">Add what you need.</span>
        </SplitReveal>
        <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-mist-400">Prices scale with the size of the home. Your exact total, including any travel fee, is shown before you pay.</p>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <article key={p.id} className={cn("group relative flex flex-col overflow-hidden rounded-2xl border bg-white/[0.02]", p.is_featured ? "border-accent-300/60 shadow-[0_0_80px_-30px_rgb(255_91_36/0.5)]" : "border-white/10")}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={p.image_url ?? PACKAGE_IMAGE[p.slug] ?? "/media/work/kagera-living.jpg"} alt={`${p.name} package example`} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.05]" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
                {p.badge && <span className="label absolute top-4 left-4 rounded-full bg-accent-300 px-3 py-1 text-ink-950">{p.badge}</span>}
              </div>
              <div className="flex flex-1 flex-col p-7 sm:p-8">
                <h3 className="font-display text-[2rem] text-bone-50">{p.name}</h3>
                <p className="mt-2 min-h-12 text-[15px] leading-relaxed text-mist-400">{p.tagline}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="label text-mist-500">From</span>
                  <span className="font-display text-[clamp(2.5rem,4vw,3.5rem)] text-bone-50 tabular-nums">{formatMoney(p.base_price_cents)}</span>
                </p>
                {p.turnaround_text && <p className="label mt-1 text-mist-500">{p.turnaround_text}</p>}
                <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                    </li>
                  ))}
                </ul>
                <TransitionLink
                  href={`/book?package=${p.slug}`}
                  data-cursor="cta"
                  className={cn(
                    "group/btn mt-8 inline-flex h-13 items-center justify-between rounded-full pr-1.5 pl-6 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors",
                    p.is_featured ? "bg-accent-300 text-ink-950 hover:bg-bone-50" : "bg-bone-50 text-ink-950 hover:bg-accent-300"
                  )}
                >
                  Book {p.name}
                  <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover/btn:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                </TransitionLink>
              </div>
            </article>
          ))}
        </div>

        {/* What's in each package */}
        <div className="mt-16 overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="What's included in each package" tabIndex={0}>
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">What each package includes</caption>
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th scope="col" className="label px-5 py-4 text-mist-400">What&rsquo;s included</th>
                {packages.map((p) => (
                  <th key={p.id} scope="col" className={cn("px-4 py-4 text-center text-[15px] font-semibold", p.is_featured ? "text-accent-300" : "text-bone-50")}>
                    {p.name}
                  </th>
                ))}
                <th scope="col" className="label px-4 py-4 text-center text-mist-400">À la carte</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-white/[0.06] last:border-0">
                  <th scope="row" className="px-5 py-3.5 text-[15px] font-medium text-bone-100">{s.name}</th>
                  {packages.map((p) => {
                    const inc = p.services.find((x) => x.service_id === s.id);
                    return (
                      <td key={p.id} className="px-4 py-3.5 text-center">
                        {inc ? (
                          <span className="inline-flex items-center justify-center gap-1 text-accent-300" aria-label={`Included${inc.quantity > 1 ? `, ${inc.quantity} of them` : ""}`}>
                            <Check className="size-4" />
                            {inc.quantity > 1 && <span className="text-[12px] font-semibold">×{inc.quantity}</span>}
                          </span>
                        ) : (
                          <Minus className="mx-auto size-4 text-mist-700" aria-label="Not included" />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-center text-[14px] text-mist-300 tabular-nums">from {formatMoney(startingPrice(s))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────────── Services ───────────── */}
      <section id="services" className="gutter scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="services-title">
        <SectionLabel index="02" className="mb-8">Everything we offer</SectionLabel>
        <SplitReveal as="h2" id="services-title" className="font-display text-section text-bone-50">
          Every angle
          <br />
          of the <span className="text-accent-300">listing.</span>
        </SplitReveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <TransitionLink key={s.id} href={`/book?service=${s.slug}`} className="group flex min-h-64 flex-col justify-between gap-10 bg-ink-950 p-7 transition-colors duration-500 hover:bg-ink-900 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-full border border-white/15 text-accent-300 transition-colors duration-500 group-hover:border-accent-300 group-hover:bg-accent-300 group-hover:text-ink-950">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                <ArrowUpRight className="size-5 text-mist-600 transition-all duration-500 group-hover:rotate-45 group-hover:text-accent-300" />
              </div>
              <div>
                <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{s.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.tagline}</p>
                <p className="label mt-5 text-accent-300">From {formatMoney(startingPrice(s))}{s.unit_label ? ` / ${s.unit_label}` : ""}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* ───────────── Films ───────────── */}
      <section id="films" className="scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="films-title">
        <div className="gutter">
          <SectionLabel index="03" className="mb-8">The films</SectionLabel>
          <SplitReveal as="h2" id="films-title" className="font-display text-section text-bone-50">
            Tours buyers
            <br />
            <span className="text-accent-300">watch twice.</span>
          </SplitReveal>
          <p className="mt-8 mb-14 max-w-xl text-[16px] leading-relaxed text-mist-400">Gimbal-smooth walkthroughs in 4K, cut with music and pacing that keep people watching — real listings we&rsquo;ve shot across the DMV.</p>
          <FilmGrid films={CINEMATIC_FILMS} />
          <h3 className="label mt-24 mb-8 text-mist-400">Vertical reels · made for Instagram, TikTok & Shorts</h3>
        </div>
        <div className="gutter">
          <ReelRail films={LISTING_REELS} />
        </div>
        <p className="gutter mt-4 text-[13px] text-mist-500">
          More on Instagram{" "}
          <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-bone-100 underline underline-offset-4 hover:text-accent-300">
            {BRAND.instagramHandle}
          </a>
          .
        </p>
      </section>

      {/* ───────────── Photos ───────────── */}
      <section id="photos" className="gutter scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="photos-title">
        <SectionLabel index="04" className="mb-8">Photography</SectionLabel>
        <SplitReveal as="h2" id="photos-title" className="font-display text-section text-bone-50">
          Bright, true
          <br />
          to <span className="text-accent-300">life.</span>
        </SplitReveal>
        <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-mist-400">HDR-blended, hand-edited finals from real listings across the DMV. Tap any photo to see it full screen.</p>
        <PhotoGallery photos={RE_PHOTOS} className="mt-14" />
      </section>

      {/* ───────────── Aerial ───────────── */}
      <section id="aerial" className="scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="aerial-title">
        <div className="gutter mb-12">
          <SectionLabel index="05" className="mb-8">Drone & aerial</SectionLabel>
          <SplitReveal as="h2" id="aerial-title" className="font-display text-section text-bone-50">
            The lot, the views,
            <br />
            the <span className="text-accent-300">neighborhood.</span>
          </SplitReveal>
        </div>
        <div className="gutter grid gap-4 md:grid-cols-2 md:gap-5">
          {[
            ["reel-1", "Waterfront home", "4K aerial"],
            ["reel-5", "Neighborhood reveal", "4K aerial"],
          ].map(([slug, title, kind]) => (
            <FilmGrid key={slug} films={[{ slug, title, place: kind }]} />
          ))}
        </div>
      </section>

      {/* ───────────── Process ───────────── */}
      <section id="process" className="gutter scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="process-title">
        <SectionLabel index="06" className="mb-8">How it works</SectionLabel>
        <SplitReveal as="h2" id="process-title" className="font-display text-section text-bone-50">
          Book in
          <br />
          <span className="text-accent-300">two minutes.</span>
        </SplitReveal>
        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {RE_STEPS.map((s) => (
            <li key={s.n} className="bg-ink-950 p-7 sm:p-8">
              <p className="font-mono text-sm text-accent-300">{s.n}</p>
              <h3 className="mt-10 text-[22px] font-semibold tracking-tight text-bone-50">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="label text-mist-500">We shoot in</p>
          {RE_AREAS.map((a) => (
            <span key={a} className="rounded-full border border-white/10 px-4 py-2 text-[14px] text-mist-300">{a}</span>
          ))}
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section id="faq" className="gutter scroll-mt-32 pb-24 sm:pb-36" aria-labelledby="faq-title">
        <SectionLabel index="07" className="mb-8">Questions</SectionLabel>
        <SplitReveal as="h2" id="faq-title" className="font-display text-section text-bone-50">
          Good to know.
        </SplitReveal>
        <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
          {RE_FAQ.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-tight text-bone-50 marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-accent-300 transition-transform duration-500 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-mist-300">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <RelatedReading slugs={["tampa-listing-media-guide", "the-first-three-seconds"]} title="Plan your next listing" />
      <FinalCta title="Ready to list?" kicker="Book your shoot." />
    </>
  );
}
