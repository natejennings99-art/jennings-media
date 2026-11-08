import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { getCatalog } from "@/lib/data/public";
import { priceForSqft, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { env } from "@/lib/env";
import { CINEMATIC_FILMS, LISTING_REELS } from "@/lib/content/real-estate";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FilmGrid, ReelRail } from "@/components/agency/film-wall";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import type { Catalog } from "@/lib/types";

export const revalidate = 300;

const PATH = "/listing-video-tampa";
const VIDEO_SLUGS = ["cinematic-video", "social-media-reel", "drone-video"];
const AREAS = ["Tampa", "South Tampa", "Westchase", "St. Petersburg", "Clearwater", "Brandon", "Riverview", "Wesley Chapel"];
/** Square-footage bands used for the film price table. */
const BANDS: [string, number][] = [
  ["Up to 2,500 sq ft", 2500],
  ["2,501–4,000 sq ft", 4000],
  ["Over 4,000 sq ft", 6000],
];

function videoOffer(catalog: Catalog) {
  const video = VIDEO_SLUGS.map((slug) => catalog.services.find((s) => s.slug === slug && s.is_bookable)).filter((s) => s !== undefined);
  const prices = video.map((s) => startingPrice(s)).filter((n) => n > 0);
  const film = video.find((s) => s.slug === "cinematic-video");
  const reel = video.find((s) => s.slug === "social-media-reel");
  return { video, film, reel, from: prices.length ? Math.min(...prices) : null };
}

export async function generateMetadata(): Promise<Metadata> {
  const { from, film } = videoOffer(await getCatalog());
  const price = from ? ` from ${formatMoney(from)}` : "";
  // "Tampa Listing Video & Reels from $199" + " | Jennings Media" = 54 characters.
  const title = `Tampa Listing Video & Reels${price}`;
  const description = `Real estate listing video for Tampa Bay agents: vertical reels${price}${film ? `, cinematic 4K walkthrough films from ${formatMoney(startingPrice(film))}` : ""}, drone add-ons. Delivered in about 48 hours.`;
  return { title, description, alternates: { canonical: PATH }, openGraph: { title, description, url: PATH, images: [{ url: "/media/video/tunlaw-penthouse.jpg" }] } };
}

const FAQ = (filmFrom: string | null, reelFrom: string | null) => [
  {
    q: "How much does a listing video cost in Tampa?",
    a: `${reelFrom ? `A vertical reel for Instagram, TikTok and Shorts starts from ${reelFrom}. ` : ""}${filmFrom ? `A cinematic walkthrough film starts from ${filmFrom} and scales with the size of the home. ` : ""}Your exact total, including any travel fee, is shown before you pay.`,
  },
  {
    q: "What's the difference between a listing film and a reel?",
    a: "A listing film is a 1–2 minute widescreen walkthrough shot on a gimbal, made for the MLS, your website, YouTube and email. A reel is a 30–60 second vertical edit with captions and a hook in the first second, made to be posted on social. Many agents book both from the same visit.",
  },
  {
    q: "How long does it take to get the video?",
    a: "Films and reels are delivered in about 48 hours. Photos from the same visit arrive the next morning.",
  },
  {
    q: "Can I be in the video?",
    a: "Yes. The cinematic film can include an optional on-camera intro from the agent, and reels can include a short cameo.",
  },
  {
    q: "Is there an MLS-safe version?",
    a: "Drone video comes in branded and unbranded (MLS) versions. If your MLS needs an unbranded cut of the walkthrough film, tell us when you book.",
  },
];

export default async function ListingVideoTampaPage() {
  const catalog = await getCatalog();
  const { video, film, reel, from } = videoOffer(catalog);
  const signature = catalog.packages.find((p) => p.is_active && p.slug === "signature");
  const faq = FAQ(film ? formatMoney(startingPrice(film)) : null, reel ? formatMoney(startingPrice(reel)) : null);

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${PATH}#service`,
    name: "Real estate listing video in Tampa Bay",
    serviceType: "Real estate video",
    description: "Cinematic listing films, vertical realtor reels and drone video for real estate agents in Tampa, St. Petersburg and Clearwater.",
    url: `${env.siteUrl}${PATH}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: AREAS.map((name) => ({ "@type": "Place", name: `${name}, FL` })),
    offers: video.map((s) => ({
      "@type": "Offer",
      name: s.name,
      priceSpecification: { "@type": "PriceSpecification", minPrice: startingPrice(s) / 100, priceCurrency: "USD" },
      url: `${env.siteUrl}/book?service=${s.slug}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqSchema(faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "Listing video in Tampa", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        label="Listing video · Tampa Bay"
        title={
          <>
            Tampa listing video
            {from ? (
              <>
                {" "}
                <span className="text-accent-300">from {formatMoney(from)}.</span>
              </>
            ) : (
              "."
            )}
          </>
        }
        aside={<BookCtaRow href={film ? `/book?service=${film.slug}` : "/book"} label="Book a listing video" />}
      >
        Cinematic walkthrough films and vertical reels for Tampa Bay agents, shot in 4K on a gimbal and delivered in about 48 hours.
        {film && reel && (
          <span className="mt-2 block text-bone-50">
            Reels from {formatMoney(startingPrice(reel))} · films from {formatMoney(startingPrice(film))}
          </span>
        )}
      </PageIntro>

      {/* ───────────── What you get ───────────── */}
      {video.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="formats-title">
          <SectionLabel index="01" className="mb-8">Formats &amp; prices</SectionLabel>
          <h2 id="formats-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            Three ways to put a listing <span className="text-accent-300">on video.</span>
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {video.map((s) => (
              <article key={s.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
                <h3 className="font-display text-[1.75rem] text-bone-50">{s.name}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.tagline}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="label text-mist-500">From</span>
                  <span className="font-display text-[clamp(2.25rem,4vw,3rem)] text-bone-50 tabular-nums">{formatMoney(startingPrice(s))}</span>
                </p>
                {s.turnaround_hours && <p className="label mt-1 text-mist-500">Delivered within {s.turnaround_hours} hours</p>}
                <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                  {s.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                    </li>
                  ))}
                </ul>
                <TransitionLink
                  href={`/book?service=${s.slug}`}
                  className="group/btn mt-8 inline-flex h-13 items-center justify-between rounded-full bg-bone-50 pr-1.5 pl-6 text-[13px] font-semibold tracking-[0.06em] text-ink-950 uppercase transition-colors hover:bg-accent-300"
                >
                  Book {s.name}
                  <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover/btn:rotate-45">
                    <ArrowUpRight className="size-4" />
                  </span>
                </TransitionLink>
              </article>
            ))}
          </div>

          {film && film.price_tiers.length > 0 && (
            <div className="mt-12 max-w-2xl overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="Listing film price by home size" tabIndex={0}>
              <table className="w-full border-collapse text-left">
                <caption className="px-5 pt-4 text-left text-[14px] text-mist-400">{film.name}: price by home size</caption>
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="label px-5 py-3 text-mist-400">Home size</th>
                    <th scope="col" className="label px-5 py-3 text-right text-mist-400">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {BANDS.map(([label, sqft]) => (
                    <tr key={label} className="border-b border-white/[0.06] last:border-0">
                      <th scope="row" className="px-5 py-3 text-[15px] font-medium text-bone-100">{label}</th>
                      <td className="px-5 py-3 text-right text-[15px] text-bone-50 tabular-nums">{formatMoney(priceForSqft(film.base_price_cents, film.price_tiers, sqft))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-8 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
            {signature && (
              <>
                The {signature.name} package bundles the film and a reel with photos, drone, a floor plan and a property website, from {formatMoney(startingPrice(signature))}.{" "}
              </>
            )}
            <TransitionLink href="/real-estate#packages" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Compare packages</TransitionLink>
            {" · "}
            <TransitionLink href="/real-estate-photography-cost-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Full Tampa price guide</TransitionLink>
          </p>
        </section>
      )}

      {/* ───────────── Samples ───────────── */}
      <section className="py-16 sm:py-24" aria-labelledby="films-title">
        <div className="gutter">
          <SectionLabel index="02" className="mb-8">Sample films</SectionLabel>
          <h2 id="films-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            From our own shoots.
          </h2>
          <p className="mt-6 mb-12 max-w-[62ch] text-[16px] leading-relaxed text-mist-400">
            Most of our listing films so far were shot around Washington, DC. Tampa shoots get the same camera, gimbal and edit. See more on the{" "}
            <TransitionLink href="/work/tunlaw-penthouse" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Tunlaw penthouse</TransitionLink>,{" "}
            <TransitionLink href="/work/great-falls-estate" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Great Falls estate</TransitionLink> and{" "}
            <TransitionLink href="/work/2933-north-fairmont-street" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Fairmont Street</TransitionLink> projects.
          </p>
          <FilmGrid films={CINEMATIC_FILMS.slice(0, 4)} />
          <h3 className="label mt-20 mb-8 text-mist-400">Vertical reels · made for Instagram, TikTok &amp; Shorts</h3>
        </div>
        <div className="gutter">
          <ReelRail films={LISTING_REELS.slice(0, 8)} />
        </div>
      </section>

      {/* ───────────── Why video ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="why-title">
        <SectionLabel index="03" className="mb-8">Why list with video</SectionLabel>
        <h2 id="why-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          A tour buyers can take <span className="text-accent-300">from their phone.</span>
        </h2>
        <div className="mt-10 max-w-[68ch] space-y-5 text-[17px] leading-relaxed text-mist-300">
          <p>
            Tampa Bay draws a lot of buyers who start their search from out of town. A walkthrough film shows how the rooms connect, how much light the home gets and what the street and the water look like, which still photos can&rsquo;t do on their own.
          </p>
          <p>
            A vertical reel is the version people actually share. We cut it with a hook in the first second and captions, so it works with the sound off in a feed. Agents use it to launch the listing, to promote the open house and to show sellers how the home is being marketed.
          </p>
          <p>
            Waterfront and larger homes often get the most from adding drone, which shows the lot, the dock and how close the home sits to the water. Every drone address is checked for airspace before booking;{" "}
            <TransitionLink href="/drone-real-estate-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">see how drone works in Tampa</TransitionLink>.
          </p>
        </div>
      </section>

      {/* ───────────── Areas ───────────── */}
      <section className="gutter py-16" aria-labelledby="areas-title">
        <h2 id="areas-title" className="mb-6">
          <SectionLabel index="04">Where we film</SectionLabel>
        </h2>
        <ul className="flex flex-wrap gap-3">
          {AREAS.map((a) => (
            <li key={a} className="rounded-full border border-white/10 px-4 py-2 text-[14px] text-mist-300">{a}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-mist-400">
          City guides:{" "}
          <TransitionLink href="/locations/tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Tampa</TransitionLink>,{" "}
          <TransitionLink href="/locations/south-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">South Tampa</TransitionLink>,{" "}
          <TransitionLink href="/locations/st-petersburg" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">St. Pete</TransitionLink>,{" "}
          <TransitionLink href="/locations/clearwater" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Clearwater</TransitionLink> and{" "}
          <TransitionLink href="/locations/westchase" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Westchase</TransitionLink>. Farther-out addresses add a per-mile travel fee, shown before you pay.
        </p>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="05" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">Listing video FAQ</h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {faq.map((f) => (
            <details key={f.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold tracking-tight text-bone-50 marker:hidden [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/15 text-accent-300 transition-transform duration-500 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-mist-300">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
          New to us?{" "}
          <TransitionLink href="/free-listing-reel" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Tampa Bay agents can claim a first reel free</TransitionLink>.
        </p>
      </section>

      <FinalCta title="Listing going live soon?" kicker="Book the film." />
    </>
  );
}
