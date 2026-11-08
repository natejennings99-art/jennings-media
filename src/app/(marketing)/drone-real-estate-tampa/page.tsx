import type { Metadata } from "next";
import { ArrowUpRight, Check, Plane } from "lucide-react";
import { getCatalog, getSettings } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { env } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { FAQS } from "@/lib/content/site";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FilmGrid } from "@/components/agency/film-wall";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import type { Catalog } from "@/lib/types";

export const revalidate = 300;

const PATH = "/drone-real-estate-tampa";
const AREAS = ["Tampa", "South Tampa", "Westchase", "St. Petersburg", "Clearwater", "Largo", "Brandon", "Riverview", "Wesley Chapel"];

/** Drone services and the lowest drone price, straight from the same catalog the pricing page reads. */
function droneOffer(catalog: Catalog) {
  const drone = catalog.services.filter((s) => s.is_bookable && s.category === "drone").sort((a, b) => a.sort_order - b.sort_order);
  const prices = drone.map((s) => startingPrice(s)).filter((n) => n > 0);
  return { drone, from: prices.length ? Math.min(...prices) : null };
}

export async function generateMetadata(): Promise<Metadata> {
  const { from } = droneOffer(await getCatalog());
  const price = from ? ` from ${formatMoney(from)}` : "";
  // Kept at 60 characters or fewer with the " | Jennings Media" suffix.
  const title = `Tampa Drone Real Estate Photos${price}`;
  const description = `FAA Part 107 certified drone photos and aerial listing video for Tampa Bay agents${price}. Every address is checked for airspace before you book. Book online.`;
  return {
    title,
    description,
    alternates: { canonical: PATH },
    openGraph: { title, description, images: [{ url: "/media/video/reel-1.jpg" }] },
  };
}

const WHAT_IT_SHOWS = [
  ["The lot", "How big the yard really is, where the lines fall and what sits next door. Lot-line overlays are available on request."],
  ["Water", "Canal frontage, dock and seawall, bay or Gulf views, and how far it is to open water."],
  ["The pool", "Pool, cage, lanai and outdoor kitchen in one frame, the way buyers picture using them."],
  ["Location", "How close the home sits to the beach, downtown, a park or the water, shown instead of described."],
] as const;

const AIRSPACE_FAQ = [
  FAQS.find((f) => /drone/i.test(f.q))!,
  {
    q: "Can you fly my listing near Tampa International or MacDill?",
    a: "Sometimes. Much of Tampa Bay sits in controlled airspace around Tampa International, MacDill Air Force Base, Albert Whitted in downtown St. Pete and St. Pete–Clearwater International. We check the exact address before booking and request FAA LAANC authorization where it's needed. Some addresses close to MacDill or Tampa International can't be flown at all; if yours is one, we tell you up front and shoot the film from the ground.",
  },
  {
    q: "What happens if the weather is bad on shoot day?",
    a: FAQS.find((f) => /weather/i.test(f.q))?.a ?? "We reschedule the aerial portion if conditions aren't safe to fly.",
  },
  {
    q: "Can I add drone to a photo or video booking?",
    a: "Yes. Drone photos and drone video can be booked on their own or added to any package at checkout, and your total updates as you choose.",
  },
];

export default async function DroneRealEstateTampaPage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  const { drone, from } = droneOffer(catalog);
  const droneIds = new Set(drone.map((s) => s.id));
  const packagesWithDrone = catalog.packages
    .filter((p) => p.is_active && p.services.some((x) => droneIds.has(x.service_id)))
    .sort((a, b) => a.sort_order - b.sort_order);
  const video = drone.find((s) => s.slug === "drone-video") ?? drone[0];
  const payLater = settings.payment_options.allow_pay_later;

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${PATH}#service`,
    name: "Drone real estate photography & video in Tampa Bay",
    serviceType: "Aerial real estate photography and video",
    description: "FAA Part 107 certified drone photos and aerial listing video for real estate agents in Tampa, St. Petersburg and Clearwater.",
    url: `${env.siteUrl}${PATH}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: AREAS.map((name) => ({ "@type": "Place", name: `${name}, FL` })),
    offers: drone.map((s) => ({ "@type": "Offer", name: s.name, price: startingPrice(s) / 100, priceCurrency: "USD", url: `${env.siteUrl}/book?service=${s.slug}` })),
  };

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqSchema(AIRSPACE_FAQ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "Drone in Tampa", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        label="Drone & aerial · Tampa Bay"
        title={
          <>
            Tampa drone real estate photo &amp; video
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
        aside={
          <div className="flex flex-wrap items-center gap-4">
            <TransitionLink
              href={video ? `/book?service=${video.slug}` : "/book"}
              data-cursor="cta"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50"
            >
              Book a drone shoot
              <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </TransitionLink>
            <TransitionLink href="/free-listing-reel" className="group inline-flex h-14 items-center gap-2 px-3 text-[14px] font-semibold tracking-[0.04em] text-accent-300 uppercase">
              <span className="border-b border-current pb-1">Tampa Bay agents: first reel free</span>
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
          </div>
        }
      >
        Aerial photos and 4K aerial listing video for agents in Tampa, St. Pete and Clearwater, flown by an FAA Part 107 certified pilot. Every address is checked for airspace before you book.{" "}
        <a href={BRAND.phoneHref} className="whitespace-nowrap text-bone-50 underline underline-offset-4 hover:text-accent-300">
          Call or text {BRAND.phone}
        </a>
      </PageIntro>

      {/* ───────────── What the drone adds ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="adds-title">
        <SectionLabel index="01" className="mb-8">What the drone adds</SectionLabel>
        <h2 id="adds-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          What a ground camera can&rsquo;t show.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_IT_SHOWS.map(([title, text]) => (
            <div key={title} className="bg-ink-950 p-7 sm:p-8">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── What's included ───────────── */}
      {drone.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="included-title">
          <SectionLabel index="02" className="mb-8">What you get</SectionLabel>
          <h2 id="included-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            Two ways to <span className="text-accent-300">book the drone.</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {drone.map((s) => (
              <article key={s.id} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
                <span className="grid size-12 place-items-center rounded-full border border-white/15 text-accent-300">
                  <Plane className="size-5" />
                </span>
                <h3 className="mt-6 font-display text-[2rem] text-bone-50">{s.name}</h3>
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
          {packagesWithDrone.length > 0 && (
            <p className="mt-8 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
              Drone photos are already included in the {packagesWithDrone.map((p) => `${p.name} (from ${formatMoney(p.base_price_cents)})`).join(" and ")}{" "}
              {packagesWithDrone.length > 1 ? "packages" : "package"}, alongside ground photography.{" "}
              <TransitionLink href="/real-estate#packages" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
                Compare packages
              </TransitionLink>
              .
            </p>
          )}
          <p className="mt-4 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
            Your exact total, including any travel fee, is shown before you pay.
            {payLater && " You can also choose to pay after the shoot, before download."}{" "}
            <TransitionLink href="/pricing" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
              Full price list
            </TransitionLink>
            .
          </p>
        </section>
      )}

      {/* ───────────── Airspace ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="airspace-title">
        <SectionLabel index="03" className="mb-8">Tampa airspace</SectionLabel>
        <h2 id="airspace-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          We check your address <span className="text-accent-300">before you book.</span>
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 text-[17px] leading-relaxed text-mist-300 lg:col-span-7">
            <p>
              Much of Tampa Bay sits inside controlled airspace around four airfields: Tampa International, MacDill Air Force Base, Albert Whitted in downtown St. Pete and St. Pete–Clearwater International. Neighborhoods such as South Tampa, Westshore and downtown St. Pete sit close to those fields, so a waterfront listing can look easy to fly and still need permission.
            </p>
            <p>
              Paid drone flights are flown by an FAA Part 107 certified pilot. Before a drone shoot is booked, Nate looks up the exact address on the FAA&rsquo;s airspace maps and, where the address is in controlled airspace, requests FAA authorization through LAANC for the flight.
            </p>
            <p>
              Some addresses close to MacDill or Tampa International can&rsquo;t be flown. If your listing is one of them, we tell you up front, before anything is booked, and the film is shot from the ground only.
            </p>
          </div>
          <ul className="space-y-3 lg:col-span-5">
            {[
              "Address checked against FAA airspace maps before booking",
              "LAANC authorization requested where the address needs it",
              "No-fly addresses flagged up front; the film is ground-only",
              "Daylight flights; aerials rescheduled if weather isn't safe",
            ].map((t) => (
              <li key={t} className="flex gap-3 rounded-xl border border-white/10 px-5 py-4 text-[15px] leading-snug text-bone-100">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── Samples ───────────── */}
      <section className="py-16 sm:py-24" aria-labelledby="samples-title">
        <div className="gutter mb-10">
          <SectionLabel index="04" className="mb-8">Aerial samples</SectionLabel>
          <h2 id="samples-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            From our own shoots.
          </h2>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-relaxed text-mist-400">
            Most of our portfolio so far was filmed around Washington, DC. These are our own aerials, shot and edited in-house.
          </p>
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

      {/* ───────────── Areas ───────────── */}
      <section className="gutter py-16" aria-labelledby="areas-title">
        <h2 id="areas-title" className="mb-6">
          <SectionLabel index="05">Where we fly</SectionLabel>
        </h2>
        <ul className="flex flex-wrap gap-3">
          {AREAS.map((a) => (
            <li key={a} className="rounded-full border border-white/10 px-4 py-2 text-[14px] text-mist-300">{a}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-[62ch] text-[15px] leading-relaxed text-mist-400">Every address subject to the airspace check above. Farther-out addresses add a per-mile travel fee, shown at checkout.</p>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="06" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">Good to know.</h2>
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {AIRSPACE_FAQ.map((f) => (
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

      <FinalCta title="Listing near the water?" kicker="Send us the address." />
    </>
  );
}
