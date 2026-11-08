import Link from "next/link";
import { Camera, Clapperboard, MessageSquare, Phone, Plane } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { env } from "@/lib/env";
import type { Catalog } from "@/lib/types";
import { startingPrice } from "@/lib/pricing/engine";
import { priceSummary } from "@/lib/pricing/summary";
import { formatMoney } from "@/lib/utils";
import { ShootRequestForm } from "@/components/booking/shoot-request-form";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

const title = (slug?: string) => (slug ? slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "");

const NEXT_STEPS = [
  ["Send the address", "Name, phone, the property address and a day that suits you. It takes about 30 seconds."],
  ["We confirm by text or call", "Within one business day we confirm the time, the home's size and your exact price, including any travel fee."],
  ["We shoot", "Photos, film and drone in one visit. Drone addresses are checked for airspace before the day."],
  ["You get your files", "Photos the next morning, films and reels in about 48 hours, ready for the MLS and social."],
] as const;

/**
 * Shown in production until the booking database is connected: a 30-second shoot request
 * (captured server-side) plus one-tap call/text, prices and what happens next, instead of a
 * wizard that fails on its last step.
 */
export function BookingSoon({ email, pkg, service, catalog }: { email: string; pkg?: string; service?: string; catalog: Pick<Catalog, "services" | "packages"> }) {
  const price = priceSummary(catalog);
  const chosenPkg = pkg ? price.packages.find((p) => p.slug === pkg) : undefined;
  const chosenSvc = !chosenPkg && service ? catalog.services.find((s) => s.slug === service && s.is_bookable) : undefined;
  const chosen = chosenPkg ? `${chosenPkg.name} package` : chosenSvc ? chosenSvc.name : pkg ? `${title(pkg)} package` : service ? title(service) : "";
  const chosenFrom = chosenPkg ? startingPrice(chosenPkg) : chosenSvc ? startingPrice(chosenSvc) : null;
  const sms = BRAND.phoneHref.replace(/^tel:/, "sms:");
  const offerLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${env.siteUrl}/book#service`,
    name: "Book a real estate photo, video or drone shoot",
    serviceType: "Real estate media",
    url: `${env.siteUrl}/book`,
    provider: { "@id": `${env.siteUrl}/#organization` },
    areaServed: ["Tampa Bay, FL", "Washington, DC"].map((name) => ({ "@type": "Place", name })),
    offers: price.packages.map((p) => ({
      "@type": "Offer",
      name: `${p.name} package`,
      priceSpecification: { "@type": "PriceSpecification", minPrice: startingPrice(p) / 100, priceCurrency: "USD" },
      url: `${env.siteUrl}/book?package=${p.slug}`,
    })),
  };
  return (
    <section className="gutter mx-auto max-w-3xl pt-28 pb-24 sm:pt-44">
      <JsonLd data={[offerLd, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Real estate", path: "/real-estate" }, { name: "Book", path: "/book" }])]} />
      <p className="label text-accent-300">Real estate media · Tampa Bay</p>
      <h1 className="mt-5 font-display text-[clamp(2.5rem,8vw,6rem)] text-bone-50 [word-spacing:0.18em]">
        Book your <span className="text-accent-300">shoot.</span>
      </h1>
      {price.line && (
        <p className="mt-5 text-[17px] font-semibold text-bone-50">
          {chosen && chosenFrom ? `${chosen} from ${formatMoney(chosenFrom)}` : price.line}
          <span className="font-normal text-mist-400"> · prices scale with home size</span>
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a href={BRAND.phoneHref} className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-300 px-5 text-[14px] font-semibold text-ink-950 hover:bg-bone-50">
          <Phone className="size-4" /> Call {BRAND.phone}
        </a>
        <a href={sms} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
          <MessageSquare className="size-4" /> Text us
        </a>
        <a href="#request" className="inline-flex h-12 items-center px-3 text-[14px] font-semibold text-mist-300 underline-offset-8 hover:text-bone-50 hover:underline">
          Or send a request
        </a>
      </div>
      <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-mist-300">
        {chosen ? (
          <>
            You picked <span className="text-bone-50">{chosen}</span>.{" "}
          </>
        ) : null}
        Send the address and a time that works, and we&rsquo;ll text or call to confirm within one business day. Photography, cinematic video, drone and floor plans across Tampa Bay and the D.C. area.
      </p>

      {price.packages.length > 0 && (
        <ul className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Packages">
          {price.packages.map((p) => (
            <li key={p.id}>
              <Link href={`/book?package=${p.slug}#request`} className={`flex h-full flex-col gap-1 rounded-md border px-4 py-3 hover:border-accent-300 ${p.slug === pkg ? "border-accent-300" : "border-white/10"}`}>
                <span className="text-[15px] font-semibold text-bone-50">{p.name}</span>
                <span className="text-[14px] text-mist-300">from {formatMoney(startingPrice(p))}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-3 grid gap-3 text-[15px] text-mist-300 sm:grid-cols-3">
        {[
          [Camera, price.photo ? `Photos from ${formatMoney(price.photo)}` : "HDR photography"],
          [Clapperboard, price.film ? `Listing film from ${formatMoney(price.film)}` : "Cinematic video & reels"],
          [Plane, price.drone ? `Drone from ${formatMoney(price.drone)}` : "Drone & aerial"],
        ].map(([Icon, label]) => {
          const I = Icon as typeof Camera;
          return (
            <li key={label as string} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.02] px-4 py-3">
              <I className="size-4 text-accent-300" />
              {label as string}
            </li>
          );
        })}
      </ul>

      <div id="request" className="mt-14 scroll-mt-24">
        <ShootRequestForm pkg={chosen || undefined} />
      </div>

      <h2 className="label mt-16 mb-6 text-mist-400">What happens next</h2>
      <ol className="grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
        {NEXT_STEPS.map(([t, d], i) => (
          <li key={t} className="bg-ink-950 p-6">
            <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
            <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/10 pt-8">
        <p className="mr-2 text-[15px] text-mist-300">Rather talk?</p>
        <a href={BRAND.phoneHref} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
          <Phone className="size-4" /> Call {BRAND.phone}
        </a>
        <a href={sms} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300">
          <MessageSquare className="size-4" /> Text us
        </a>
        <Link href="/pricing" className="inline-flex h-12 items-center px-3 text-[14px] font-semibold text-mist-300 underline-offset-8 hover:text-bone-50 hover:underline">
          See full pricing
        </Link>
      </div>
      <p className="mt-6 text-[13px] text-mist-500">
        Or email <a className="text-mist-300 underline underline-offset-4" href={`mailto:${email}`}>{email}</a>.
      </p>
    </section>
  );
}
