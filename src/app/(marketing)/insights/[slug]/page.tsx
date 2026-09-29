import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES } from "@/lib/content/agency";
import { BRAND } from "@/lib/brand";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "@/components/agency/section-label";
import { ReadingProgress } from "@/components/agency/reading-progress";
import { FinalCta } from "@/components/agency/final-cta";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/components/seo/json-ld";
import { formatCalendarDate } from "@/lib/utils";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: { type: "article", publishedTime: a.date, images: [{ url: a.image }] },
  };
}

export default async function ArticlePage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const index = ARTICLES.findIndex((a) => a.slug === slug);
  if (index === -1) notFound();
  const a = ARTICLES[index];
  const next = ARTICLES[(index + 1) % ARTICLES.length];
  return (
    <article>
      <ReadingProgress />
      <JsonLd data={[articleSchema(a), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: a.title, path: `/insights/${a.slug}` }])]} />
      <header className="gutter pt-36 sm:pt-48">
        <SectionLabel className="mb-8 animate-fade-in">
          {a.category} · {formatCalendarDate(a.date, { month: "long", day: "numeric", year: "numeric" })} · {a.minutes} min read
        </SectionLabel>
        <SplitReveal as="h1" immediate className="max-w-[16ch] font-display text-[clamp(3rem,9vw,9rem)] text-bone-50">
          {a.title}
        </SplitReveal>
        <p className="mt-10 max-w-2xl animate-fade-up text-[clamp(1.2rem,2vw,1.6rem)] leading-snug text-mist-300 [animation-delay:500ms]">{a.excerpt}</p>
      </header>
      <div className="relative mt-16 aspect-[4/5] w-full sm:mt-24 sm:aspect-[21/9]">
        <Image src={a.image} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
      <div className="gutter grid gap-12 py-20 sm:py-28 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="label space-y-2 text-mist-500 lg:sticky lg:top-32">
            <p>Written by</p>
            <p className="text-bone-100">{BRAND.name} Studio</p>
          </div>
        </aside>
        <div className="max-w-2xl space-y-7 text-[18px] leading-[1.75] text-bone-100/85 lg:col-span-7">
          {a.body.map((b, i) => {
            if (b.type === "h2") return <h2 key={i} className="pt-6 text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight font-semibold tracking-[-0.03em] text-bone-50">{b.text}</h2>;
            if (b.type === "quote")
              return (
                <blockquote key={i} className="border-l-2 border-accent-300 py-2 pl-6 text-[clamp(1.4rem,2.4vw,2rem)] leading-snug font-medium tracking-[-0.02em] text-bone-50">
                  {b.text}
                </blockquote>
              );
            if (b.type === "list")
              return (
                <ul key={i} className="space-y-3 border-y border-white/10 py-6">
                  {b.items.map((item) => (
                    <li key={item} className="flex gap-4">
                      <span className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-accent-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              );
            return <p key={i}>{b.text}</p>;
          })}
        </div>
      </div>
      {next.slug !== a.slug && (
        <TransitionLink href={`/insights/${next.slug}`} className="group gutter block border-t border-white/10 py-16 sm:py-24">
          <p className="label text-mist-400">Next read</p>
          <p className="mt-4 flex items-start gap-4 font-display text-[clamp(2.25rem,6vw,6rem)] text-bone-50">
            {next.title}
            <ArrowUpRight className="mt-[0.08em] size-[0.7em] shrink-0 text-accent-300 transition-transform duration-500 group-hover:rotate-45" strokeWidth={2.5} />
          </p>
        </TransitionLink>
      )}
      <FinalCta />
    </article>
  );
}
