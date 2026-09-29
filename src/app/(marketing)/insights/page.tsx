import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES } from "@/lib/content/agency";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { formatCalendarDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Insights — Creative, Performance & Growth",
  description: "Field notes on creative that performs, paid media, content systems and growth strategy.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const [featured, ...rest] = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }])} />
      <PageIntro label="Insights" title={<>Field <span className="text-accent-300">notes.</span></>}>
        What we&rsquo;re learning about attention, creative and growth — written for people who run marketing, not for algorithms.
      </PageIntro>
      <div className="gutter">
        <TransitionLink href={`/insights/${featured.slug}`} data-cursor="view" data-cursor-label="Read" className="group grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-md lg:col-span-7">
            <Image src={featured.image} alt="" fill priority sizes="(min-width:1024px) 58vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-105" />
          </div>
          <div className="flex flex-col justify-between gap-6 lg:col-span-5">
            <p className="label text-mist-400">
              <span className="text-accent-300">{featured.category}</span> · {formatCalendarDate(featured.date, { month: "short", day: "numeric", year: "numeric" })} · {featured.minutes} min read
            </p>
            <div>
              <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] text-bone-50 transition-transform duration-700 ease-(--ease-expo) group-hover:translate-x-2">{featured.title}</h2>
              <p className="mt-5 max-w-md text-[16px] leading-relaxed text-mist-300">{featured.excerpt}</p>
            </div>
            <span className="label flex items-center gap-2 text-bone-50">
              Read article <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </div>
        </TransitionLink>
        <div className="mt-20 grid gap-x-10 gap-y-16 md:grid-cols-2">
          {rest.map((a) => (
            <TransitionLink key={a.slug} href={`/insights/${a.slug}`} data-cursor="view" data-cursor-label="Read" className="group block border-t border-white/10 pt-8">
              <div className="relative aspect-[16/10] overflow-hidden rounded-md">
                <Image src={a.image} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-105" />
              </div>
              <p className="label mt-6 text-mist-400">
                <span className="text-accent-300">{a.category}</span> · {a.minutes} min read
              </p>
              <h2 className="mt-3 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight font-semibold tracking-[-0.03em] text-bone-50">{a.title}</h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-mist-400">{a.excerpt}</p>
            </TransitionLink>
          ))}
        </div>
      </div>
      <div className="h-24 sm:h-40" />
      <FinalCta />
    </>
  );
}
