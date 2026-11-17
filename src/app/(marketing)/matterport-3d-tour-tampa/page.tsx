import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getCatalog, getServiceAreas } from "@/lib/data/public";
import { sortTiers, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { env } from "@/lib/env";
import { REQUEST_BOOKING_ANSWER, REQUEST_RESCHEDULE_ANSWER, bookingRequestMode } from "@/lib/content/real-estate";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";
import { RE_BOOK_CTA } from "@/lib/content/real-estate-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import type { Catalog, PriceTier, ServiceArea } from "@/lib/types";

export const revalidate = 300;

const PATH = "/matterport-3d-tour-tampa";
const SLUG = "matterport-3d-tour";
const BOOK_HREF = `/book?service=${SLUG}`;

/** The 3D tour and the floor plan that can be added to it, straight from the catalog the pricing page reads. */
function tourOffer(catalog: Catalog) {
  const tour = catalog.services.find((s) => s.slug === SLUG && s.is_bookable);
  const floorPlan = catalog.services.find((s) => s.slug === "floor-plans" && s.is_bookable);
  return { tour, floorPlan, from: tour ? startingPrice(tour) : null };
}

/** "Up to 2,000 sq ft" / "Over 5,000 sq ft" rows for a tiered price. */
function tierRows(tiers: PriceTier[]) {
  const sorted = sortTiers(tiers);
  return sorted.map((t, i) => ({
    label: t.max_sqft !== null ? `Up to ${t.max_sqft.toLocaleString("en-US")} sq ft` : `Over ${(sorted[i - 1]?.max_sqft ?? 0).toLocaleString("en-US")} sq ft`,
    price: t.price_cents,
  }));
}

const CITY_NAMES: Record<string, string> = { "st petersburg": "St. Petersburg", "land o lakes": "Land O' Lakes" };
const cityName = (c: string) => CITY_NAMES[c] ?? c.replace(/\b\w/g, (ch) => ch.toUpperCase());
const cityList = (a: ServiceArea) => a.cities.filter((c) => c !== "saint petersburg").map(cityName);

export async function generateMetadata(): Promise<Metadata> {
  const { from } = tourOffer(await getCatalog());
  const price = from ? ` from ${formatMoney(from)}` : "";
  // "Matterport 3D Tours in Tampa from $199" + " | Jennings Media" = 55 characters.
  const title = `Matterport 3D Tours in Tampa${price}`;
  const description = `Matterport 3D tours in Tampa Bay${price}, priced by home size. Dollhouse and floor-plan views, branded and MLS links, delivered in 48 hours.`;
  return { title, description, alternates: { canonical: PATH }, openGraph: { title, description, url: PATH } };
}

const WHEN_IT_HELPS = [
  ["Out-of-town buyers", "Buyers who can't easily walk the home in person can still move through it room by room."],
  ["The layout sells it", "When the floor plan is a selling point, or hard to picture from photos alone, the tour shows how the rooms connect."],
  ["Bigger homes", "A larger home with many rooms is easier to understand as a model than as a long run of photos."],
  ["Room sizes matter", "Buyers can check how big a room or wall is before they book a showing."],
] as const;

export default async function MatterportTourTampaPage() {
  const [catalog, areas] = await Promise.all([getCatalog(), getServiceAreas()]);
  const { tour, floorPlan } = tourOffer(catalog);
  const requestMode = bookingRequestMode();
  const rows = tour ? tierRows(tour.price_tiers) : [];
  const lo = rows.length ? Math.min(...rows.map((r) => r.price)) : null;
  const hi = rows.length ? Math.max(...rows.map((r) => r.price)) : null;
  const planRows = floorPlan ? tierRows(floorPlan.price_tiers) : [];
  const turnaround = tour?.turnaround_hours ?? null;
  const minutes = tour?.duration_minutes ?? null;
  const noticeHours = tour?.scheduling_rules.min_notice_hours ?? null;
  const tampa = areas.filter((a) => a.is_active && a.market === "Tampa Bay");
  const core = tampa.filter((a) => a.travel_fee_cents === 0 && a.per_mile_cents === 0);
  const extended = tampa.filter((a) => a.travel_fee_cents > 0 || a.per_mile_cents > 0);

  const priceAnswer = rows.length
    ? `With us, ${rows.map((r) => `${formatMoney(r.price)} ${r.label.charAt(0).toLowerCase()}${r.label.slice(1)}`).join(", ")}.${core.length ? " There's no travel fee in our Tampa Bay core area." : ""}`
    : "3D tours are priced by the size of the home. We confirm your exact price before the shoot.";

  const faq = [
    { q: "How much does a Matterport tour cost in Tampa?", a: priceAnswer },
    {
      q: "Is a Matterport 3D tour worth it?",
      a: "It depends on the listing. It's most useful when buyers can't easily visit, when the layout matters, or when the home is large. For a small, simple home, good photos may be enough. We're happy to talk it through before you book.",
    },
    { q: "How fast will I get my tour?", a: turnaround ? `3D tours are delivered within ${turnaround} hours of the scan.` : "3D tours are delivered shortly after the scan." },
    {
      q: "Can I use the tour on the MLS?",
      a: "Yes. Every tour comes with a branded link for your own marketing and an MLS-compliant unbranded link for places where your MLS doesn't allow agent branding. The tour can also be embedded on a website.",
    },
    {
      q: "How do I book a 3D tour?",
      a: requestMode ? REQUEST_BOOKING_ANSWER : "Pick the 3D tour on the booking page, give us the home's size and choose a time. You'll see your exact price, including any travel fee, before you confirm.",
    },
    { q: "Can I reschedule?", a: requestMode ? REQUEST_RESCHEDULE_ANSWER : "Yes. Reschedule or cancel free of charge up to 24 hours before your appointment." },
  ];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${PATH}#service`,
    name: "Matterport 3D tours in Tampa Bay",
    serviceType: "Matterport 3D virtual tour",
    description: tour?.description ?? "Matterport 3D tours for real estate listings in Tampa Bay.",
    url: `${env.siteUrl}${PATH}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: ["Tampa, FL", "St. Petersburg, FL", "Clearwater, FL", "Tampa Bay, FL"].map((name) => ({ "@type": "Place", name })),
    ...(tour
      ? { offers: [{ "@type": "Offer", name: tour.name, priceSpecification: { "@type": "PriceSpecification", minPrice: startingPrice(tour) / 100, priceCurrency: "USD" }, url: `${env.siteUrl}${BOOK_HREF}` }] }
      : {}),
  };

  const th = "label px-4 py-3 text-mist-400 whitespace-nowrap";
  const link = "text-bone-50 underline underline-offset-4 hover:text-accent-300";

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqSchema(faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "3D tours in Tampa", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        label="3D tours · Tampa Bay"
        title={
          <>
            Matterport 3D tours in <span className="text-accent-300">Tampa Bay.</span>
          </>
        }
        aside={<BookCtaRow href={BOOK_HREF} label="Book a 3D tour" />}
      >
        {lo && hi && (
          <span className="block text-bone-50">
            {lo === hi ? formatMoney(lo) : `${formatMoney(lo)} to ${formatMoney(hi)}`}, based on the size of the home.
          </span>
        )}
        <span className="mt-2 block">
          {minutes ? `About ${minutes === 60 ? "an hour" : `${minutes} minutes`} on site. ` : ""}
          {turnaround ? `Your tour links within ${turnaround} hours. ` : ""}
          {core.length ? "No travel fee in the Tampa Bay core area." : ""}
        </span>
      </PageIntro>

      {/* ───────────── What it is ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="what-title">
        <SectionLabel index="01" className="mb-8">What you get</SectionLabel>
        <h2 id="what-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          A walkthrough buyers can <span className="text-accent-300">take from anywhere.</span>
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 text-[17px] leading-relaxed text-mist-300 lg:col-span-7">
            <p>
              A 3D tour is a walkthrough buyers can explore on their phone or computer, any time. We scan the home with Matterport Pro. Buyers walk room to room, pull back to a
              &ldquo;dollhouse&rdquo; view of the whole home as a 3D model, or switch to a floor-plan view from above. Measurement mode lets them check how big a room or wall is.
            </p>
            <p>
              Every tour comes with two links. The branded link is for your own marketing: your website, emails and social posts. The unbranded link is MLS-compliant, for places where
              your MLS doesn&rsquo;t allow agent branding.
            </p>
          </div>
          {tour && (
            <ul className="space-y-3 lg:col-span-5">
              {tour.features.map((f) => (
                <li key={f} className="flex gap-3 rounded-xl border border-white/10 px-5 py-4 text-[15px] leading-snug text-bone-100">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                </li>
              ))}
              <li className="flex gap-3 rounded-xl border border-white/10 px-5 py-4 text-[15px] leading-snug text-bone-100">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> Measurement mode
              </li>
            </ul>
          )}
        </div>
      </section>

      {/* ───────────── Price by size ───────────── */}
      {rows.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="price-title">
          <SectionLabel index="02" className="mb-8">Price by home size</SectionLabel>
          <h2 id="price-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            3D tour prices, <span className="text-accent-300">by square foot.</span>
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="3D tour prices by home size" tabIndex={0}>
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Matterport 3D tour prices by home size</caption>
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th scope="col" className={th}>Home size</th>
                    <th scope="col" className={`${th} text-right`}>3D tour</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-b border-white/[0.06] last:border-0">
                      <th scope="row" className="px-4 py-3 text-[15px] font-medium text-bone-100 whitespace-nowrap">{r.label}</th>
                      <td className="px-4 py-3 text-right text-[15px] text-bone-50 tabular-nums">{formatMoney(r.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-5 text-[16px] leading-relaxed text-mist-300">
              <p>
                {minutes ? `Plan on about ${minutes} minutes on site. ` : ""}
                {noticeHours ? `Please ask at least ${noticeHours} hours ahead. ` : ""}
                {turnaround ? `Your tour is delivered within ${turnaround} hours, and both links are hosted for six months.` : ""}
              </p>
              {floorPlan && planRows.length > 0 && (
                <p>
                  Want a floor plan too? A measured 2D floor plan with room dimensions can be added to a 3D tour:{" "}
                  {planRows.map((r) => `${formatMoney(r.price)} ${r.label.charAt(0).toLowerCase()}${r.label.slice(1)}`).join(", ")}.
                </p>
              )}
              <p>
                You can also add a 3D tour when you book photography or a floor plan. See every price on the{" "}
                <TransitionLink href="/pricing" className={link}>full price list</TransitionLink>.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ───────────── When it's worth it ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="when-title">
        <SectionLabel index="03" className="mb-8">3D tour, photos or video?</SectionLabel>
        <h2 id="when-title" className="max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
          Which listings <span className="text-accent-300">need one.</span>
        </h2>
        <p className="mt-8 max-w-[68ch] text-[17px] leading-relaxed text-mist-300">
          Photos are the base of every listing, and buyers look at them first. Video tells the story of a home and how it feels. A 3D tour does a different job: it shows how the rooms
          connect and how big they really are. It tends to make the most sense when:
        </p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {WHEN_IT_HELPS.map(([t, d]) => (
            <div key={t} className="bg-ink-950 p-7 sm:p-8">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[68ch] text-[16px] leading-relaxed text-mist-300">
          For a small, simple home, good photos may be all you need. Not sure? Ask us and we&rsquo;ll give you a straight answer. Compare{" "}
          <TransitionLink href="/real-estate-photography-cost-tampa" className={link}>photography prices</TransitionLink> and{" "}
          <TransitionLink href="/listing-video-tampa" className={link}>listing video</TransitionLink>.
        </p>
      </section>

      {/* ───────────── Service area ───────────── */}
      {tampa.length > 0 && (
        <section className="gutter py-16" aria-labelledby="areas-title">
          <h2 id="areas-title" className="mb-6">
            <SectionLabel index="04">Service area &amp; travel</SectionLabel>
          </h2>
          {core.map((a) => (
            <p key={a.id} className="max-w-[68ch] text-[16px] leading-relaxed text-mist-300">
              <span className="text-bone-50">No travel fee</span> in our {a.name} area: {cityList(a).join(", ")}.
            </p>
          ))}
          {extended.map((a) => (
            <p key={a.id} className="mt-4 max-w-[68ch] text-[16px] leading-relaxed text-mist-300">
              We also cover {a.name}, including {cityList(a).join(", ")}. The travel fee there is {formatMoney(a.travel_fee_cents)}
              {a.per_mile_cents > 0 ? `, plus ${formatMoney(a.per_mile_cents)} per mile beyond ${a.free_miles} miles` : ""}.
            </p>
          ))}
        </section>
      )}

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="05" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">3D tour FAQ</h2>
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
          <TransitionLink href="/real-estate" className={link}>real estate photo &amp; video</TransitionLink>,{" "}
          <TransitionLink href="/drone-real-estate-tampa" className={link}>drone in Tampa</TransitionLink> and{" "}
          <TransitionLink href="/pricing" className={link}>pricing</TransitionLink>.
        </p>
      </section>

      <FinalCta title="Big home or tricky layout?" kicker="Book the 3D tour." {...RE_BOOK_CTA} href={BOOK_HREF} label="Book a 3D tour" />
    </>
  );
}
