import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CONTENT_PACKAGE } from "@/lib/content/content-package";
import { INDUSTRY_PAGES, INDUSTRY_STEPS, findIndustryPage } from "@/lib/content/industries";
import { showPlaceholders, tierPriceLabel } from "@/lib/content/offers";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { CallForm } from "@/components/agency/call-form";
import { ProjectSlot } from "@/components/agency/project-slot";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, industryServiceSchema } from "@/components/seo/json-ld";

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRY_PAGES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const ind = findIndustryPage((await params).slug);
  if (!ind) return {};
  return {
    title: ind.seoTitle,
    description: ind.description,
    alternates: { canonical: `/industries/${ind.slug}` },
    openGraph: { title: ind.seoTitle, description: ind.description, images: [{ url: "/opengraph-image" }] },
  };
}

const cta = "group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50";

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const ind = findIndustryPage((await params).slug);
  if (!ind) notFound();
  const path = `/industries/${ind.slug}`;
  const placeholders = showPlaceholders();
  const others = INDUSTRY_PAGES.filter((i) => i.slug !== ind.slug);

  return (
    <>
      <JsonLd data={[industryServiceSchema(ind), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }, { name: ind.name, path }])]} />
      <PageIntro
        label={ind.label}
        title={
          <>
            {ind.h1[0]}
            <br />
            <span className="text-accent-300 text-[0.8em] sm:text-[1em]">{ind.h1[1]}</span>
          </>
        }
        aside={
          <a href="#book" className={cta}>
            Book a call
            <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
          </a>
        }
      >
        {ind.intro}
      </PageIntro>

      <section className="gutter grid gap-14 pb-24 lg:grid-cols-12 lg:gap-10" aria-labelledby="gets-title">
        <div className="lg:col-span-5">
          <SectionLabel index="01" className="mb-6">
            What you get
          </SectionLabel>
          <h2 id="gets-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            What you get.
          </h2>
          <ul className="mt-10 space-y-4 border-t border-white/10 pt-10">
            {ind.gets.map((g) => (
              <li key={g} className="flex gap-3 text-[17px] leading-snug text-mist-200">
                <Check className="mt-1 size-4 shrink-0 text-accent-300" /> {g}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.02] p-6">
            <p className="label text-mist-500">Price</p>
            {ind.price.kind === "content-package" && (
              <>
                <p className="mt-3 font-display text-[2rem] text-bone-50">{CONTENT_PACKAGE.priceLabel}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">
                  That is our {CONTENT_PACKAGE.name}: one shoot a month, edited photos and four short videos.{" "}
                  <TransitionLink href="/content-package" className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
                    See what&rsquo;s in it
                  </TransitionLink>
                  . Want something smaller or bigger? Ask on the call.
                </p>
              </>
            )}
            {ind.price.kind === "link" && (
              <p className="mt-3 text-[15.5px] leading-relaxed text-mist-300">
                {ind.price.text}{" "}
                <TransitionLink href={ind.price.href} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
                  {ind.price.cta}
                </TransitionLink>
                .
              </p>
            )}
            {ind.price.kind === "ask" && (
              <>
                <p className="mt-3 font-display text-[1.6rem] text-bone-50">{tierPriceLabel({ price: null }, placeholders)}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">Every place is different. Tell us about yours on the call and we&rsquo;ll give you a price.</p>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          {(ind.examples.length > 0 || placeholders) && (
            <>
              <SectionLabel index="02" className="mb-6">
                From our shoots
              </SectionLabel>
              <ul className="grid gap-4 sm:grid-cols-2">
                {ind.examples.map((e) => (
                  <li key={e.src}>
                    <figure>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-900">
                        <Image src={e.src} alt={e.alt} fill sizes="(min-width:1024px) 28vw, (min-width:640px) 45vw, 100vw" className="object-cover" />
                      </div>
                      <figcaption className="mt-3 text-[14px] leading-snug text-mist-400">{e.caption}</figcaption>
                    </figure>
                  </li>
                ))}
                {placeholders && (
                  <li>
                    <ProjectSlot hint={`Add a real shoot for ${ind.name === "Airbnb hosts" ? "an Airbnb host" : ind.name.toLowerCase()} here once you have one.`} />
                  </li>
                )}
              </ul>
              {ind.examples.length > 0 && <p className="mt-5 text-[14px] leading-relaxed text-mist-500">Real photos from our own shoots. Yours will look like you.</p>}
            </>
          )}
          <TransitionLink href={ind.related.href} className="group mt-8 inline-flex items-center gap-2 text-[14px] font-semibold tracking-[0.04em] text-bone-50 uppercase hover:text-accent-300">
            {ind.related.label}
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </TransitionLink>
        </div>
      </section>

      <section className="gutter pb-24" aria-labelledby="ind-how-title">
        <SectionLabel index="03" className="mb-6">
          How it works
        </SectionLabel>
        <h2 id="ind-how-title" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {INDUSTRY_STEPS.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="book" className="gutter grid scroll-mt-28 gap-14 pb-24 lg:grid-cols-12" aria-labelledby="book-title">
        <div className="lg:col-span-7">
          <SectionLabel index="04" className="mb-6">
            Book a call
          </SectionLabel>
          <h2 id="book-title" className="mb-10 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Free 15-minute call.
          </h2>
          <CallForm page={path} businessPlaceholder={ind.slug === "airbnb-hosts" ? "Your listing or company" : ind.slug === "realtors" ? "Your brokerage" : `Your ${ind.name.toLowerCase().replace(/s$/, "")}`} />
        </div>
        <aside className="space-y-10 lg:col-span-4 lg:col-start-9 lg:pt-36">
          <div>
            <SectionLabel className="mb-4">Rather call or text?</SectionLabel>
            <a href={BRAND.phoneHref} className="text-lg text-bone-50 hover:text-accent-300">
              {BRAND.phone}
            </a>
            <p className="mt-1 text-[15px] text-mist-500">{BRAND.hours}</p>
          </div>
          <div>
            <SectionLabel className="mb-4">Where we work</SectionLabel>
            <p className="text-[15.5px] text-mist-300">{BRAND.location}</p>
          </div>
        </aside>
      </section>

      <nav className="gutter pb-32" aria-labelledby="other-industries-title">
        <h2 id="other-industries-title" className="mb-6">
          <SectionLabel>Who else we work with</SectionLabel>
        </h2>
        <ul className="flex flex-wrap gap-3">
          {others.map((o) => (
            <li key={o.slug}>
              <TransitionLink href={`/industries/${o.slug}`} className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[14px] text-mist-300 transition-colors hover:border-accent-300 hover:text-bone-50">
                {o.name}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
