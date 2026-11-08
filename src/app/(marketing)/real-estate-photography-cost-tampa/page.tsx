import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getCatalog } from "@/lib/data/public";
import { priceForSqft, startingPrice } from "@/lib/pricing/engine";
import { priceSummary } from "@/lib/pricing/summary";
import { formatMoney } from "@/lib/utils";
import { env } from "@/lib/env";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import type { PriceTier } from "@/lib/types";

export const revalidate = 300;

const PATH = "/real-estate-photography-cost-tampa";

/** Home-size bands for the price table, with a square footage inside each band to price it at. */
const BANDS: [string, number][] = [
  ["Up to 1,500", 1500],
  ["1,501–2,500", 2500],
  ["2,501–3,500", 3500],
  ["3,501–5,000", 5000],
  ["Over 5,000", 6000],
];

/** Services shown in the à-la-carte table. 3D tours are left out until they're confirmed as a delivered service. */
const SERVICE_SLUGS = ["photography", "drone-photography", "drone-video", "cinematic-video", "social-media-reel", "floor-plans", "twilight-photography", "virtual-twilight"];

export async function generateMetadata(): Promise<Metadata> {
  const { line } = priceSummary(await getCatalog());
  // "Real Estate Photography Cost in Tampa, 2026" + " | Jennings Media" = 60 characters.
  const title = "Real Estate Photography Cost in Tampa, 2026";
  const description = `What real estate photography costs in Tampa, by home size.${line ? ` ${line}.` : ""} Drone, video, floor plan and twilight prices too.`;
  return { title, description, alternates: { canonical: PATH }, openGraph: { title, description, url: PATH, images: [{ url: "/media/photos/craftsman-exterior.jpg" }] } };
}

const range = (base: number, tiers: PriceTier[]) => {
  const prices = BANDS.map(([, sqft]) => priceForSqft(base, tiers, sqft));
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? formatMoney(lo) : `${formatMoney(lo)}–${formatMoney(hi)}`;
};

export default async function RealEstatePhotographyCostTampaPage() {
  const catalog = await getCatalog();
  const price = priceSummary(catalog);
  const services = SERVICE_SLUGS.map((slug) => catalog.services.find((s) => s.slug === slug && s.is_bookable)).filter((s) => s !== undefined);
  const photo = services.find((s) => s.slug === "photography");
  const sized = services.filter((s) => s.price_tiers.length > 0);
  const flat = services.filter((s) => s.price_tiers.length === 0);
  const money = (c: number | null) => (c ? formatMoney(c) : null);
  const droneIds = new Set(catalog.services.filter((s) => s.category === "drone").map((s) => s.id));
  const withDrone = price.packages.filter((p) => p.services.some((x) => droneIds.has(x.service_id))).map((p) => p.name);

  const faq = [
    {
      q: "How much does real estate photography cost in Tampa?",
      a: photo
        ? `With us, listing photography costs ${range(photo.base_price_cents, photo.price_tiers)} depending on the size of the home, starting from ${formatMoney(startingPrice(photo))} for homes up to 1,500 sq ft.${price.pkg ? ` Packages that add a floor plan, drone, a property website or a film start from ${money(price.pkg)}.` : ""} Your exact total, including any travel fee, is shown before you pay.`
        : "Listing photography is priced by the size of the home. Your exact total, including any travel fee, is shown before you pay.",
    },
    {
      q: "Why does the price depend on square footage?",
      a: "A bigger home has more rooms to light, shoot and edit, so it takes longer on site and longer in editing. Pricing by size keeps small condos affordable and keeps large homes from being rushed.",
    },
    {
      q: "Is drone included?",
      a: `${withDrone.length ? `Drone photos are included in the ${withDrone.join(" and ")} ${withDrone.length > 1 ? "packages" : "package"} and` : "Drone"} can be added to any booking${price.drone ? ` from ${money(price.drone)}` : ""}. Every drone address is checked for airspace first, because parts of Tampa Bay sit near Tampa International, MacDill and other airfields.`,
    },
    {
      q: "Is there a travel fee in Tampa Bay?",
      a: "Inside our core Tampa Bay area, including Tampa, St. Petersburg and Clearwater, there's no travel fee. Addresses farther out add a small per-mile fee, shown before you pay.",
    },
    {
      q: "How fast are photos delivered?",
      a: "Photos are delivered the next morning, sized for the MLS. Films and reels take about 48 hours.",
    },
  ];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${PATH}#service`,
    name: "Real estate photography in Tampa Bay",
    serviceType: "Real estate photography",
    url: `${env.siteUrl}${PATH}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: ["Tampa, FL", "St. Petersburg, FL", "Clearwater, FL", "Tampa Bay, FL"].map((name) => ({ "@type": "Place", name })),
    offers: [...price.packages, ...services].map((x) => ({
      "@type": "Offer",
      name: "features" in x && "services" in x ? `${x.name} package` : x.name,
      priceSpecification: { "@type": "PriceSpecification", minPrice: startingPrice(x) / 100, priceCurrency: "USD" },
    })),
  };

  const th = "label px-4 py-3 text-mist-400 whitespace-nowrap";
  const td = "px-4 py-3 text-right text-[15px] text-bone-50 tabular-nums whitespace-nowrap";

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqSchema(faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "Pricing", path: "/pricing" },
            { name: "Cost in Tampa", path: PATH },
          ]),
        ]}
      />

      <PageIntro label="Price guide · Tampa Bay" title={<>What real estate photography costs in <span className="text-accent-300">Tampa.</span></>} aside={<BookCtaRow />}>
        {price.line && <span className="block text-bone-50">{price.line}, priced by home size.</span>}
        <span className="mt-2 block">Every price on this page comes from our live price list. Your exact total, including any travel fee, is confirmed before you pay.</span>
      </PageIntro>

      {/* ───────────── Packages by size ───────────── */}
      {price.packages.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="packages-title">
          <SectionLabel index="01" className="mb-8">Packages by home size</SectionLabel>
          <h2 id="packages-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            Package prices, <span className="text-accent-300">by square foot.</span>
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="Package prices by home size" tabIndex={0}>
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">Package prices by home size in square feet</caption>
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th scope="col" className={th}>Home size (sq ft)</th>
                  {price.packages.map((p) => (
                    <th key={p.id} scope="col" className={`${th} text-right`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BANDS.slice(1).map(([label, sqft], i) => (
                  <tr key={label} className="border-b border-white/[0.06] last:border-0">
                    <th scope="row" className="px-4 py-3 text-[15px] font-medium text-bone-100 whitespace-nowrap">{i === 0 ? "Up to 2,500" : label}</th>
                    {price.packages.map((p) => (
                      <td key={p.id} className={td}>{formatMoney(priceForSqft(p.base_price_cents, p.price_tiers, sqft))}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {price.packages.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 p-5">
                <p className="text-[17px] font-semibold text-bone-50">
                  {p.name} <span className="font-normal text-mist-400">from {formatMoney(startingPrice(p))}</span>
                </p>
                <ul className="mt-3 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-[14px] leading-snug text-mist-300">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent-300" /> {f}
                    </li>
                  ))}
                </ul>
                <TransitionLink href={`/book?package=${p.slug}`} className="mt-4 inline-block text-[14px] font-semibold text-bone-50 underline underline-offset-4 hover:text-accent-300">
                  Book {p.name}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ───────────── À la carte ───────────── */}
      {services.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="alacarte-title">
          <SectionLabel index="02" className="mb-8">À la carte</SectionLabel>
          <h2 id="alacarte-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            Single services, <span className="text-accent-300">priced by size.</span>
          </h2>
          {sized.length > 0 && (
            <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="Service prices by home size" tabIndex={0}>
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Service prices by home size in square feet</caption>
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th scope="col" className={th}>Service</th>
                    {BANDS.map(([label]) => (
                      <th key={label} scope="col" className={`${th} text-right`}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sized.map((s) => (
                    <tr key={s.id} className="border-b border-white/[0.06] last:border-0">
                      <th scope="row" className="px-4 py-3 text-[15px] font-medium text-bone-100">
                        <TransitionLink href={`/book?service=${s.slug}`} className="hover:text-accent-300">{s.name}</TransitionLink>
                      </th>
                      {BANDS.map(([label, sqft]) => (
                        <td key={label} className={td}>{formatMoney(priceForSqft(s.base_price_cents, s.price_tiers, sqft))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {flat.length > 0 && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {flat.map((s) => (
                <li key={s.id} className="rounded-xl border border-white/10 p-5">
                  <p className="text-[16px] font-semibold text-bone-50">{s.name}</p>
                  <p className="mt-1 text-[15px] text-mist-300">
                    From {formatMoney(startingPrice(s))}
                    {s.unit_label ? ` per ${s.unit_label}` : ", any size"}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-mist-500">{s.tagline}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 max-w-[62ch] text-[16px] leading-relaxed text-mist-300">
            Add-ons such as rush delivery and key pickup are listed on the{" "}
            <TransitionLink href="/pricing" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">full price list</TransitionLink>.
          </p>
        </section>
      )}

      {/* ───────────── What changes the price ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="drivers-title">
        <SectionLabel index="03" className="mb-8">What changes the total</SectionLabel>
        <h2 id="drivers-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          Four things move the price.
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2">
          {[
            ["Home size", "Photography, floor plans, films and packages are priced by square footage. A 1,400 sq ft condo and a 5,500 sq ft waterfront home take very different amounts of time to shoot and edit."],
            ["What you add", "Drone, a walkthrough film, a vertical reel, twilight photos or a floor plan each add to the total. Packages bundle the common combinations for less than booking them one by one."],
            ["Where the home is", "There's no travel fee inside our core Tampa Bay area. Addresses farther out add a small per-mile fee, which is shown before you pay."],
            ["Airspace", "Drone shots depend on the address. Parts of Tampa, St. Pete and Clearwater sit near airports and MacDill Air Force Base. We check every address first, and if it can't be flown we tell you before anything is booked."],
          ].map(([t, d]) => (
            <div key={t} className="bg-ink-950 p-7 sm:p-8">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-[68ch] text-[17px] leading-relaxed text-mist-300">
          When you compare quotes from Tampa photographers, check what&rsquo;s included at each price: how many edited photos, whether drone and a floor plan are in the package, how fast files are delivered and whether travel is extra. Our photography includes 25–60 hand-edited HDR photos depending on the home, delivered the next morning.
        </p>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="04" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">Cost FAQ</h2>
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
        <p className="mt-10 max-w-[68ch] text-[16px] leading-relaxed text-mist-300">
          Keep reading:{" "}
          <TransitionLink href="/real-estate" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">real estate photo &amp; video</TransitionLink>,{" "}
          <TransitionLink href="/listing-video-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">listing video</TransitionLink>,{" "}
          <TransitionLink href="/drone-real-estate-tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">drone in Tampa</TransitionLink>,{" "}
          <TransitionLink href="/locations/tampa" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Tampa</TransitionLink>,{" "}
          <TransitionLink href="/locations/st-petersburg" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">St. Pete</TransitionLink> and{" "}
          <TransitionLink href="/locations/clearwater" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">Clearwater</TransitionLink>.
        </p>
      </section>

      <FinalCta title="Know your square footage?" kicker="Book your shoot." />
    </>
  );
}
