import type { Metadata } from "next";
import { Check, Moon, Sunset } from "lucide-react";
import { getCatalog, getServiceAreas } from "@/lib/data/public";
import { sortTiers, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { env } from "@/lib/env";
import { FAQS } from "@/lib/content/site";
import { SectionLabel } from "@/components/agency/section-label";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";
import { RE_BOOK_CTA } from "@/lib/content/real-estate-cta";
import { TransitionLink } from "@/components/experience/transition";
import { BookCtaRow } from "@/components/marketing/book-cta-row";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import type { Catalog, Service } from "@/lib/types";

export const revalidate = 300;

const PATH = "/twilight-real-estate-photography-tampa";
const BOOK_HREF = "/book?service=twilight-photography";

/** On-site twilight, virtual twilight and listing photography, straight from the catalog the pricing page reads. */
function twilightOffer(catalog: Catalog) {
  const svc = (slug: string) => catalog.services.find((s) => s.slug === slug && s.is_bookable);
  return { onsite: svc("twilight-photography"), virtual: svc("virtual-twilight"), photo: svc("photography") };
}

export async function generateMetadata(): Promise<Metadata> {
  const { onsite, virtual } = twilightOffer(await getCatalog());
  // "Twilight Real Estate Photos in Tampa Bay" + " | Jennings Media" = 57 characters.
  const title = "Twilight Real Estate Photos in Tampa Bay";
  const options = [
    onsite && `an on-site sunset shoot for a flat ${formatMoney(startingPrice(onsite))}`,
    virtual && `a virtual twilight edit for ${formatMoney(startingPrice(virtual))} per ${virtual.unit_label ?? "image"}`,
  ].filter(Boolean);
  const description = options.length
    ? `Twilight real estate photography in Tampa Bay: ${options.join(", or ")}. Compare the two and book.`
    : "Twilight real estate photography in Tampa Bay: on-site sunset shoots and virtual twilight edits for listings. Compare the two and book.";
  return { title, description, alternates: { canonical: PATH }, openGraph: { title, description, url: PATH, images: [{ url: "/media/photos/twilight-deck.jpg" }] } };
}

const SUITS = [
  ["Waterfront homes", "Bay views, seawalls and docks look calm and rich at dusk."],
  ["Pools", "A lit pool against a blue sky makes a strong first photo."],
  ["Good exterior lighting", "Landscape lights, porch lights and big windows all glow on camera."],
] as const;

const weatherAnswer = FAQS.find((f) => /weather/i.test(f.q))!.a;

/** Names of the services an add-on can be added to, e.g. "photography or drone photography". */
function addedTo(catalog: Catalog, service: Service | undefined) {
  if (!service) return null;
  const addOn = catalog.addOns.find((a) => a.is_active && a.service_id === service.id);
  if (!addOn?.trigger_service_ids.length) return null;
  const names = addOn.trigger_service_ids.map((id) => catalog.services.find((s) => s.id === id)?.name.replace(/^Professional /, "").toLowerCase()).filter(Boolean);
  return names.length ? names.join(" or ") : null;
}

export default async function TwilightTampaPage() {
  const [catalog, areas] = await Promise.all([getCatalog(), getServiceAreas()]);
  const { onsite, virtual, photo } = twilightOffer(catalog);
  const freeCore = areas.some((a) => a.is_active && a.market === "Tampa Bay" && a.travel_fee_cents === 0 && a.per_mile_cents === 0);
  const onsitePrice = onsite ? formatMoney(startingPrice(onsite)) : null;
  const virtualPrice = virtual ? `${formatMoney(startingPrice(virtual))} per ${virtual.unit_label ?? "image"}` : null;
  const images = onsite?.features.find((f) => /images/i.test(f));
  const onsiteAddTo = addedTo(catalog, onsite);
  const virtualAddTo = addedTo(catalog, virtual);
  const photoTiers = photo ? sortTiers(photo.price_tiers) : [];

  const faq = [
    {
      q: "Is twilight photography worth it?",
      a: `It depends on the home. For waterfront homes, pools and homes with good exterior lighting, twilight photos can make the listing stand out.${virtualPrice ? ` If you want one strong dusk photo on a budget, start with a virtual twilight edit at ${virtualPrice}.` : ""}${onsitePrice ? ` If the dusk view is a key part of the home, book the ${onsitePrice} on-site shoot.` : ""}`,
    },
    {
      q: "What time is the twilight shoot?",
      a: `It depends on that day's sunset. You pick the date, we arrive before sunset and set the time around it.${onsite?.duration_minutes ? ` We're on site for about ${onsite.duration_minutes} minutes.` : ""}`,
    },
    { q: "What if it rains on the day?", a: weatherAnswer },
    {
      q: "What is the difference between a twilight shoot and virtual twilight?",
      a: "A twilight shoot is a separate visit at sunset: the lights are really on and the sky really is that color. Virtual twilight is an edit: our editors turn a daytime exterior into a dusk scene, with no second visit.",
    },
  ];

  const offerFor = (s: Service) => ({
    "@type": "Offer",
    name: s.name,
    priceSpecification: { "@type": "PriceSpecification", minPrice: startingPrice(s) / 100, priceCurrency: "USD", ...(s.unit_label ? { unitText: s.unit_label } : {}) },
    url: `${env.siteUrl}/book?service=${s.slug}`,
  });
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}${PATH}#service`,
    name: "Twilight real estate photography in Tampa Bay",
    serviceType: "Twilight real estate photography",
    url: `${env.siteUrl}${PATH}`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: ["Tampa, FL", "St. Petersburg, FL", "Clearwater, FL", "Tampa Bay, FL"].map((name) => ({ "@type": "Place", name })),
    offers: [onsite, virtual].filter((s) => s !== undefined).map(offerFor),
  };

  const link = "text-bone-50 underline underline-offset-4 hover:text-accent-300";
  const h2 = "max-w-[22ch] font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50";
  const th = "label px-4 py-3 text-mist-400";
  const td = "px-4 py-3 align-top text-[15px] leading-snug text-mist-300";
  const rows: [string, string, string][] = onsite && virtual
    ? [
        ["Price", `${onsitePrice} flat`, virtualPrice!],
        ["Visit", `Separate visit around sunset${onsite.duration_minutes ? `, about ${onsite.duration_minutes} minutes` : ""}`, "No visit. We edit your daytime photos."],
        ["Images", images ?? "Twilight images", virtual.max_quantity ? `Up to ${virtual.max_quantity} images` : "Per image"],
        ["What is shown", "Exterior and key interiors", "Daytime exteriors turned to dusk"],
        ["Turnaround", onsite.turnaround_hours ? `${onsite.turnaround_hours} hours` : "—", virtual.turnaround_hours ? `${virtual.turnaround_hours} hours, delivered with your photos` : "Delivered with your photos"],
        ["Weather", "Free reschedule if conditions aren't right", "Not affected by the weather at sunset"],
      ]
    : [];

  return (
    <>
      <JsonLd
        data={[
          serviceLd,
          faqSchema(faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Real estate", path: "/real-estate" },
            { name: "Twilight in Tampa", path: PATH },
          ]),
        ]}
      />

      <PageIntro
        label="Twilight · Tampa Bay"
        title={
          <>
            Twilight photos for Tampa Bay <span className="text-accent-300">listings.</span>
          </>
        }
        aside={<BookCtaRow href={BOOK_HREF} label="Book a twilight shoot" />}
      >
        You have two ways to get twilight photos for a listing.
        {onsitePrice && ` Book an on-site twilight shoot for a flat ${onsitePrice}, and we photograph the home at sunset.`}
        {virtualPrice && ` Or add a virtual twilight edit for ${virtualPrice}, and we turn a daytime exterior into a dusk scene with no second visit.`}
        {onsite?.turnaround_hours && virtual?.turnaround_hours === onsite.turnaround_hours && ` Both are delivered in ${onsite.turnaround_hours} hours.`}
      </PageIntro>

      {/* ───────────── The two options ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="options-title">
        <SectionLabel index="01" className="mb-8">Two ways to get it</SectionLabel>
        <h2 id="options-title" className={h2}>
          A real sunset, <span className="text-accent-300">or an edit.</span>
        </h2>
        <p className="mt-8 max-w-[68ch] text-[17px] leading-relaxed text-mist-300">
          Twilight photos show a home at dusk, with a deep blue sky and the lights glowing from inside. They stand out in a list of daytime photos and make the home feel warm and lived in.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {onsite && (
            <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
              <span className="grid size-12 place-items-center rounded-full border border-white/15 text-accent-300">
                <Moon className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-[2rem] text-bone-50">On-site twilight shoot</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{(onsite.description ?? "We arrive before sunset and capture the exterior and key interiors as the sky turns deep blue.").replace(/\s*Scheduled automatically[^.]*\./, "")}</p>
              <p className="mt-6 font-display text-[clamp(2.25rem,4vw,3rem)] text-bone-50 tabular-nums">
                {onsitePrice} <span className="label text-mist-500">flat</span>
              </p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                {onsite.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[15px] leading-relaxed text-mist-300">
                This is the real thing: the lights are really on and the sky really is that color. It&rsquo;s the right choice when the dusk view is a big part of how you&rsquo;ll sell the home.
              </p>
            </article>
          )}
          {virtual && (
            <article className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-7 sm:p-8">
              <span className="grid size-12 place-items-center rounded-full border border-white/15 text-accent-300">
                <Sunset className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-[2rem] text-bone-50">Virtual twilight edit</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{virtual.description ?? "Our editors turn a daytime exterior into a dusk scene, with no second visit."}</p>
              <p className="mt-6 font-display text-[clamp(2.25rem,4vw,3rem)] text-bone-50 tabular-nums">
                {formatMoney(startingPrice(virtual))} <span className="label text-mist-500">per {virtual.unit_label ?? "image"}</span>
              </p>
              <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
                {virtual.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[15px] leading-relaxed text-mist-300">
                Pick your best front exterior for this. It&rsquo;s a low-cost way to get one strong twilight hero photo for the listing.{" "}
                <TransitionLink href={`/book?service=${virtual.slug}`} className={link}>Ask for virtual twilight</TransitionLink>.
              </p>
            </article>
          )}
        </div>
      </section>

      {/* ───────────── Side by side ───────────── */}
      {rows.length > 0 && (
        <section className="gutter py-16 sm:py-24" aria-labelledby="compare-title">
          <SectionLabel index="02" className="mb-8">Side by side</SectionLabel>
          <h2 id="compare-title" className={h2}>
            Shoot or edit, <span className="text-accent-300">compared.</span>
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-white/10" role="region" aria-label="Twilight shoot and virtual twilight compared" tabIndex={0}>
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">On-site twilight shoot compared with a virtual twilight edit</caption>
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <td className={th} />
                  <th scope="col" className={th}>On-site twilight shoot</th>
                  <th scope="col" className={th}>Virtual twilight edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, a, b]) => (
                  <tr key={label} className="border-b border-white/[0.06] last:border-0">
                    <th scope="row" className="px-4 py-3 align-top text-[15px] font-medium text-bone-100 whitespace-nowrap">{label}</th>
                    <td className={td}>{a}</td>
                    <td className={td}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ───────────── Which homes ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="suits-title">
        <SectionLabel index="03" className="mb-8">Which homes it suits</SectionLabel>
        <h2 id="suits-title" className={h2}>
          Best when there&rsquo;s <span className="text-accent-300">something to light up.</span>
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:grid-cols-3">
          {SUITS.map(([t, d]) => (
            <div key={t} className="bg-ink-950 p-7 sm:p-8">
              <h3 className="text-[22px] font-semibold tracking-tight text-bone-50">{t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[68ch] text-[16px] leading-relaxed text-mist-300">If the home has none of these, a single virtual twilight edit of the front may be all you need.</p>
      </section>

      {/* ───────────── Weather & booking ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="weather-title">
        <SectionLabel index="04" className="mb-8">Weather &amp; booking</SectionLabel>
        <h2 id="weather-title" className={h2}>
          Storm on the day? <span className="text-accent-300">Free reschedule.</span>
        </h2>
        <div className="mt-8 max-w-[68ch] space-y-5 text-[17px] leading-relaxed text-mist-300">
          <p>
            Afternoons in Tampa Bay can bring storms, especially in summer. {weatherAnswer} A virtual twilight edit doesn&rsquo;t depend on the weather at sunset, which makes it a good backup when
            the forecast looks bad and the listing date is close.
          </p>
          {(onsiteAddTo || virtualAddTo) && (
            <p>
              You can add twilight when you book listing photos.
              {onsiteAddTo && ` A twilight shoot can be added to ${onsiteAddTo}.`}
              {virtualAddTo && ` A virtual twilight edit can be added to ${virtualAddTo}.`}
            </p>
          )}
          {photoTiers.length > 0 && (
            <p>
              Listing photography is{" "}
              {photoTiers
                .map((t, i) => `${formatMoney(t.price_cents)} ${t.max_sqft !== null ? `up to ${t.max_sqft.toLocaleString("en-US")} sq ft` : `over ${(photoTiers[i - 1]?.max_sqft ?? 0).toLocaleString("en-US")} sq ft`}`)
                .join(", ")}
              .{freeCore && " There\u2019s no travel fee in our Tampa Bay core area, including Tampa, St. Petersburg and Clearwater."} See every price on the{" "}
              <TransitionLink href="/pricing" className={link}>pricing page</TransitionLink> or{" "}
              <TransitionLink href="/real-estate-photography-cost-tampa" className={link}>what real estate photography costs in Tampa</TransitionLink>.
            </p>
          )}
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="gutter py-16 sm:py-24" aria-labelledby="faq-title">
        <SectionLabel index="05" className="mb-8">Questions</SectionLabel>
        <h2 id="faq-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">Twilight FAQ</h2>
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
          Getting the home ready? Use our{" "}
          <TransitionLink href="/how-to-prepare-home-for-real-estate-photos-tampa" className={link}>photo prep checklist</TransitionLink>.
        </p>
      </section>

      <FinalCta title="Golden hour, booked." kicker="Pick your date." {...RE_BOOK_CTA} href={BOOK_HREF} label="Book a twilight shoot" />
    </>
  );
}
