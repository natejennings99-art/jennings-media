import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Plus } from "lucide-react";
import { getCatalog, getSettings } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney, cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/page-hero";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal } from "@/components/motion/reveal";
import { Accent } from "@/components/ui/misc";
import { ServiceIcon } from "@/components/ui/icon";
import { buttonStyles } from "@/components/ui/button";
import { JsonLd, serviceSchema } from "@/components/seo/json-ld";
import { IMAGES } from "@/lib/content/images";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Real Estate Photography, Video, Drone & 3D Tour Services",
  description:
    "Listing photography, drone photos and video, cinematic property films, vertical reels, Matterport 3D tours, floor plans, virtual twilight, property websites and marketing kits.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  const services = [...catalog.services].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      <JsonLd data={services.map((s) => serviceSchema(s, settings))} />
      <PageHero
        eyebrow="Services"
        title={
          <>
            Media for every <Accent>listing</Accent>, every budget.
          </>
        }
        description="Order one service or combine several into a single visit. Every service includes professional editing and delivery to your client dashboard."
        image={IMAGES.houseNight}
      >
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <a key={s.id} href={`#${s.slug}`} className="glass rounded-full px-4 py-2 text-[13px] text-bone-100 transition hover:bg-white/10">
              {s.name}
            </a>
          ))}
        </div>
      </PageHero>

      <div className="container-page space-y-6 pb-12 sm:space-y-8">
        {services.map((s, i) => (
          <Reveal key={s.id}>
            <article id={s.slug} className="surface grid scroll-mt-28 overflow-hidden rounded-[32px] lg:grid-cols-2">
              <div className={cn("relative min-h-[18rem] sm:min-h-[24rem]", i % 2 === 1 && "lg:order-2")}>
                {s.image_url && (
                  <Image src={s.image_url} alt={s.name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent" />
                {s.gallery.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {s.gallery.slice(0, 3).map((g) => (
                      <div key={g.url} className="relative size-16 overflow-hidden rounded-xl border border-white/20 sm:size-20">
                        <Image src={g.url} alt={g.alt ?? ""} fill sizes="80px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col p-7 sm:p-10 lg:p-12">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl border border-gold-300/20 bg-gold-300/[0.08] text-gold-200">
                    <ServiceIcon name={s.icon} className="size-5" />
                  </span>
                  {s.is_addon_eligible && s.is_bookable && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-[11.5px] text-mist-300">
                      <Plus className="size-3" /> Available as an add-on
                    </span>
                  )}
                </div>
                <h2 className="mt-6 text-3xl font-medium tracking-[-0.04em] text-bone-50 sm:text-4xl">{s.name}</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-mist-300">{s.tagline}</p>
                {s.description && <p className="mt-4 text-[15px] leading-relaxed text-mist-400">{s.description}</p>}
                <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-bone-100">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold-300" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-4 pt-9 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-mist-400">
                    <span className="text-[13px]">Starting at </span>
                    <span className="text-2xl font-medium tracking-[-0.03em] text-bone-50">{formatMoney(startingPrice(s))}</span>
                    {s.pricing_model === "per_unit" && s.unit_label && <span className="text-[13px]"> / {s.unit_label}</span>}
                    {s.pricing_model === "sqft" && <span className="text-[13px]"> · scales with size</span>}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/services/${s.slug}`} className={buttonStyles({ variant: "outline" })}>
                      Details <ArrowUpRight className="size-4" />
                    </Link>
                    {s.is_bookable ? (
                      <Link href={`/book?service=${s.slug}`} className={buttonStyles()}>
                        Book <ArrowRight className="size-4" />
                      </Link>
                    ) : (
                      <Link href="/contact?reason=custom_quote" className={buttonStyles()}>
                        Get a quote <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <FinalCta />
    </>
  );
}
