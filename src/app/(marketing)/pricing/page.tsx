import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getCatalog, getServiceAreas, getSettings } from "@/lib/data/public";
import { addOnUnitPrice, sortTiers, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { PageHero } from "@/components/marketing/page-hero";
import { PackageCards } from "@/components/marketing/package-cards";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/agency/final-cta";
import { Accent, SectionHeading } from "@/components/ui/misc";
import { ServiceIcon } from "@/components/ui/icon";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { FAQS } from "@/lib/content/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Real Estate Media Pricing",
  description: "Transparent real estate media pricing. Essential, Pro and Signature packages that scale with home size, plus à-la-carte services and add-ons.",
  alternates: { canonical: "/pricing" },
};

const PRICING_FAQ = FAQS.filter((f) => /pay|fast|reschedule|weather/i.test(f.q));

export default async function PricingPage() {
  const [catalog, areas, settings] = await Promise.all([getCatalog(), getServiceAreas(), getSettings()]);
  const services = catalog.services.filter((s) => s.is_bookable);
  const servicesById = new Map(catalog.services.map((s) => [s.id, s]));
  const standaloneAddOns = catalog.addOns.filter((a) => !a.service_id);
  const pay = settings.payment_options;

  return (
    <>
      <JsonLd data={faqSchema(PRICING_FAQ)} />
      <PageHero
        eyebrow="Real estate media"
        title={
          <>
            Pricing that&rsquo;s as <Accent>clear</Accent> as our photos.
          </>
        }
        description="Pick a package or build your own. Prices scale with home size, and your exact total — including any travel fee — is shown before you pay."
      />

      <section className="container-page pb-24">
        <PackageCards packages={catalog.packages} interactive />
      </section>

      <section className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="À la carte" title="Build your own order" description="Every service, individually priced by home size." className="mb-10" />
        <div className="surface overflow-hidden rounded-[28px]">
          <div className="hidden grid-cols-12 gap-4 border-b border-white/[0.07] px-7 py-4 text-[12px] tracking-[0.12em] text-mist-500 uppercase md:grid">
            <span className="col-span-5">Service</span>
            <span className="col-span-5">Pricing by size</span>
            <span className="col-span-2 text-right">From</span>
          </div>
          {services.map((s) => {
            const tiers = sortTiers(s.price_tiers);
            return (
              <div key={s.id} className="grid gap-3 border-b border-white/[0.05] px-6 py-5 last:border-0 md:grid-cols-12 md:items-center md:gap-4 md:px-7">
                <div className="flex items-center gap-3.5 md:col-span-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
                    <ServiceIcon name={s.icon} className="size-4.5" />
                  </span>
                  <div>
                    <Link href={`/services/${s.slug}`} className="font-medium text-bone-50 hover:text-accent-100">
                      {s.name}
                    </Link>
                    <p className="line-clamp-1 text-[13px] text-mist-500">{s.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 md:col-span-5">
                  {tiers.length > 0 ? (
                    tiers.map((t, i) => (
                      <span key={i} className="rounded-full border border-white/10 px-2.5 py-1 text-[12px] text-mist-300">
                        {t.max_sqft ? `≤${(t.max_sqft / 1000).toFixed(1).replace(".0", "")}k` : `${((tiers[i - 1]?.max_sqft ?? 0) / 1000).toFixed(1).replace(".0", "")}k+`} sq ft · {formatMoney(t.price_cents)}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] text-mist-400">
                      Flat rate{s.unit_label ? ` per ${s.unit_label}` : ""}
                    </span>
                  )}
                </div>
                <p className="text-lg font-medium tracking-[-0.02em] md:col-span-2 md:text-right">{formatMoney(startingPrice(s))}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <SectionHeading eyebrow="Add-ons" title="Finishing touches" description="Offered at checkout based on what you book." className="mb-10" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {catalog.addOns.map((a) => (
            <div key={a.id} className="surface rounded-[22px] p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
                  <ServiceIcon name={a.icon} className="size-4" />
                </span>
                <span className="text-[15px] font-medium">
                  {a.service_id ? "From " : "+"}
                  {formatMoney(a.service_id ? startingPrice(servicesById.get(a.service_id) ?? { base_price_cents: 0, price_tiers: [] }) : addOnUnitPrice(a, servicesById, null))}
                </span>
              </div>
              <p className="mt-4 font-medium text-bone-50">{a.name}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-mist-400">
                {a.description}
                {a.unit_label ? ` (per ${a.unit_label})` : ""}
              </p>
            </div>
          ))}
          <div className="surface rounded-[22px] p-5">
            <span className="grid size-9 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
              <MapPin className="size-4" />
            </span>
            <p className="mt-4 font-medium text-bone-50">Travel fee</p>
            <p className="mt-1 text-[13px] leading-relaxed text-mist-400">
              Calculated automatically from the property address.{" "}
              {areas.filter((a) => a.travel_fee_cents === 0).length > 0 &&
                `Free inside ${areas.filter((a) => a.travel_fee_cents === 0).map((a) => a.name).join(", ")}.`}
            </p>
          </div>
        </div>
        {standaloneAddOns.length === 0 && null}
      </section>

      <section className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="Payment" title="Flexible checkout" />
          <ul className="mt-6 space-y-2 text-[15px] text-mist-300">
            {pay.allow_full && <li>· Pay in full by card, Apple Pay or Google Pay</li>}
            {pay.allow_deposit && (
              <li>
                · Or reserve with a {pay.deposit_type === "percent" ? `${pay.deposit_value}%` : formatMoney(pay.deposit_value)} deposit
              </li>
            )}
            {pay.allow_pay_later && <li>· Or pay after the shoot, before download</li>}
          </ul>
          <Link href="/book" className={buttonStyles({ className: "mt-8" })}>
            Start booking <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="lg:col-span-8">
          <Faq items={PRICING_FAQ} />
        </div>
      </section>
      <FinalCta title="Ready to book your shoot?" kicker="Two minutes, online." />
    </>
  );
}
