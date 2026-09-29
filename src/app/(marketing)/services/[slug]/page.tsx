import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { getCatalog, getSettings } from "@/lib/data/public";
import { packagePrice, sortTiers, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";
import { FinalCta } from "@/components/marketing/final-cta";
import { Eyebrow } from "@/components/ui/misc";
import { ServiceIcon } from "@/components/ui/icon";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, breadcrumbSchema, serviceSchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = (await getCatalog()).services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.seo_title || service.name,
    description: service.seo_description || service.tagline || undefined,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { images: service.image_url ? [{ url: service.image_url }] : undefined },
  };
}

function tierLabel(max: number | null, prev: number | null) {
  if (max === null) return `${prev ? (prev + 1).toLocaleString() : "Any"}+ sq ft`;
  return prev ? `${(prev + 1).toLocaleString()} – ${max.toLocaleString()} sq ft` : `Up to ${max.toLocaleString()} sq ft`;
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  const service = catalog.services.find((s) => s.slug === slug);
  if (!service) notFound();
  const tiers = sortTiers(service.price_tiers);
  const packages = catalog.packages.filter((p) => p.services.some((ps) => ps.service_id === service.id));
  const others = catalog.services.filter((s) => s.id !== service.id && s.is_bookable).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          serviceSchema(service, settings),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <Link href="/services" className="mb-8 inline-flex items-center gap-2 text-sm text-mist-400 transition hover:text-bone-50">
              <ArrowLeft className="size-4" /> All services
            </Link>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl border border-gold-300/20 bg-gold-300/[0.08] text-gold-200">
                <ServiceIcon name={service.icon} className="size-5" />
              </span>
              <Eyebrow>{service.category.replace("_", " ")}</Eyebrow>
            </div>
            <h1 className="mt-6 text-balance text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-medium tracking-[-0.05em] text-bone-50">{service.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-mist-300">{service.tagline}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <p>
                <span className="text-sm text-mist-400">From </span>
                <span className="text-3xl font-medium tracking-[-0.04em] text-bone-50">{formatMoney(startingPrice(service))}</span>
                {service.pricing_model === "per_unit" && service.unit_label && <span className="text-sm text-mist-400"> / {service.unit_label}</span>}
              </p>
              {service.turnaround_hours && (
                <p className="flex items-center gap-2 text-sm text-mist-300">
                  <Clock className="size-4 text-gold-300" /> Delivered in {service.turnaround_hours <= 24 ? "24 hours" : `${Math.round(service.turnaround_hours / 24)} days`}
                </p>
              )}
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {service.is_bookable ? (
                <Link href={`/book?service=${service.slug}`} className={buttonStyles({ size: "lg" })}>
                  Book {service.name} <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link href="/contact?reason=custom_quote" className={buttonStyles({ size: "lg" })}>
                  Request a quote <ArrowRight className="size-4" />
                </Link>
              )}
              <Link href="/pricing" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                See pricing
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10 lg:col-span-6">
            {service.image_url && <Image src={service.image_url} alt={service.name} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-12 lg:grid-cols-3">
        <div className="surface rounded-[28px] p-8 lg:col-span-2">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">What&rsquo;s included</h2>
          {service.description && <p className="mt-4 text-[15.5px] leading-relaxed text-mist-300">{service.description}</p>}
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {service.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[15px] text-bone-100">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-300/15 text-gold-200">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="surface rounded-[28px] p-8">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Pricing</h2>
          {tiers.length > 0 ? (
            <dl className="mt-5 divide-y divide-white/[0.07]">
              {tiers.map((t, i) => (
                <div key={i} className="flex justify-between py-3 text-[14.5px]">
                  <dt className="text-mist-300">{tierLabel(t.max_sqft, i > 0 ? tiers[i - 1].max_sqft : null)}</dt>
                  <dd className="font-medium text-bone-50">{formatMoney(t.price_cents)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-5 text-3xl font-medium tracking-[-0.04em]">
              {formatMoney(service.base_price_cents)}
              {service.unit_label && <span className="text-base text-mist-400"> / {service.unit_label}</span>}
            </p>
          )}
          <p className="mt-5 text-[13px] text-mist-500">Travel fees are calculated automatically from the property address at checkout.</p>
        </div>
      </section>

      {service.gallery.length > 0 && (
        <section className="container-page py-12">
          <div className="grid gap-3 sm:grid-cols-3">
            {service.gallery.map((g) => (
              <div key={g.url} className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10">
                <Image src={g.url} alt={g.alt ?? service.name} fill sizes="(min-width:640px) 33vw, 100vw" className="object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      )}

      {packages.length > 0 && (
        <section className="container-page py-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Save with a package</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {packages.map((p) => (
              <Link key={p.id} href={`/book?package=${p.slug}`} className="surface group rounded-[26px] p-6 transition hover:border-white/20">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium">{p.name}</p>
                  <ArrowRight className="size-4 text-mist-400 transition group-hover:translate-x-1 group-hover:text-bone-50" />
                </div>
                <p className="mt-1 text-sm text-mist-400">{p.tagline}</p>
                <p className="mt-5 text-2xl font-medium tracking-[-0.03em]">From {formatMoney(packagePrice(p, null))}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <h2 className="text-2xl font-medium tracking-[-0.03em]">Pairs well with</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {others.map((s) => (
            <Link key={s.id} href={`/services/${s.slug}`} className="group relative block aspect-[16/10] overflow-hidden rounded-[26px] border border-white/10">
              {s.image_url && <Image src={s.image_url} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover opacity-70 transition duration-700 group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <p className="text-lg font-medium">{s.name}</p>
                <p className="text-sm text-mist-300">From {formatMoney(startingPrice(s))}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
