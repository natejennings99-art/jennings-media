import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { CONTENT_PACKAGE, CONTENT_PACKAGE_FAQS } from "@/lib/content/content-package";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { ContentPackageExamples } from "@/components/agency/content-package-examples";
import { ContentPackageForm } from "@/components/agency/content-package-form";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { Faq } from "@/components/marketing/faq";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: `Tampa Restaurant Content Creator, ${CONTENT_PACKAGE.priceLabel.replace("/month", "/mo")}`,
  description: `Content for Tampa Bay restaurants, gyms, salons and shops: one shoot a month, edited photos and four vertical videos for ${CONTENT_PACKAGE.priceLabel}. Also in DC.`,
  alternates: { canonical: "/content-package" },
};

export default function ContentPackagePage() {
  const offer = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: CONTENT_PACKAGE.name,
    provider: { "@type": "Organization", name: BRAND.name, url: env.siteUrl },
    description: CONTENT_PACKAGE.sub,
    offers: { "@type": "Offer", price: CONTENT_PACKAGE.price, priceCurrency: "USD", url: `${env.siteUrl}/content-package` },
  };
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Monthly content package", path: "/content-package" }])} />
      <JsonLd data={offer} />
      <JsonLd data={faqSchema(CONTENT_PACKAGE_FAQS)} />
      <PageIntro
        label={`For local businesses · ${CONTENT_PACKAGE.priceLabel}`}
        title={
          <>
            One shoot a month.
            <br />
            <span className="text-accent-300">A month of content.</span>
          </>
        }
        aside={
          <div className="flex flex-col gap-5 sm:items-end">
            <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none text-bone-50">
              {CONTENT_PACKAGE.priceLabel.replace("/month", "")}
              <span className="text-[0.4em] text-mist-400">/month</span>
            </p>
            <a href="#book" className="group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50">
              Book a call
              <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-5" />
              </span>
            </a>
          </div>
        }
      >
        {CONTENT_PACKAGE.sub} We come to you once a month, shoot, edit and hand you photos plus four short vertical videos. You post, we repeat.
      </PageIntro>

      <section className="gutter grid gap-14 pb-24 lg:grid-cols-12 lg:gap-10" aria-labelledby="included-title">
        <div className="lg:col-span-5">
          <SectionLabel index="01" className="mb-6">
            What&rsquo;s included
          </SectionLabel>
          <h2 id="included-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Everything, for {CONTENT_PACKAGE.priceLabel.replace("/month", " a month")}.
          </h2>
          <ul className="mt-10 space-y-4 border-t border-white/10 pt-10">
            {CONTENT_PACKAGE.includes.map((f) => (
              <li key={f} className="flex gap-3 text-[17px] leading-snug text-mist-200">
                <Check className="mt-1 size-4 shrink-0 text-accent-300" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <SectionLabel index="02" className="mb-6">
            What you get each month
          </SectionLabel>
          <ContentPackageExamples />
          <p className="mt-5 text-[14px] leading-relaxed text-mist-500">Examples from our own shoots for local businesses. Yours will look like you.</p>
        </div>
      </section>

      <section className="gutter pb-24" aria-labelledby="how-title">
        <SectionLabel index="03" className="mb-6">
          How it works
        </SectionLabel>
        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {CONTENT_PACKAGE.steps.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="gutter pb-24" aria-labelledby="cp-faq-title">
        <SectionLabel className="mb-6">Questions</SectionLabel>
        <h2 id="cp-faq-title" className="mb-10 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
          Before you book.
        </h2>
        <Faq items={CONTENT_PACKAGE_FAQS} />
      </section>

      <section id="book" className="gutter grid scroll-mt-28 gap-14 pb-32 lg:grid-cols-12" aria-labelledby="book-title">
        <div className="lg:col-span-7">
          <SectionLabel index="04" className="mb-6">
            Book a call
          </SectionLabel>
          <h2 id="book-title" className="mb-10 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Four fields. Nate calls you.
          </h2>
          <ContentPackageForm />
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
            <SectionLabel className="mb-4">Price</SectionLabel>
            <p className="text-lg text-bone-50">{CONTENT_PACKAGE.priceLabel}</p>
            <p className="mt-1 text-[15px] text-mist-500">One flat price. Ad spend, if you ever want ads, is separate.</p>
          </div>
          <div>
            <SectionLabel className="mb-4">Where</SectionLabel>
            <p className="text-[15.5px] text-mist-300">{BRAND.location}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
