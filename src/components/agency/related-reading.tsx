import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES } from "@/lib/content/agency";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "./section-label";

/** Hand-picked Insights articles at the end of a page — internal links that help readers and search engines. */
export function RelatedReading({ slugs, title = "Further reading" }: { slugs: string[]; title?: string }) {
  const articles = slugs.map((s) => ARTICLES.find((a) => a.slug === s)).filter((a) => a !== undefined);
  if (!articles.length) return null;
  return (
    <section className="gutter pb-24 sm:pb-32" aria-labelledby="related-reading">
      <SectionLabel className="mb-8">Insights</SectionLabel>
      <h2 id="related-reading" className="mb-10 font-display text-[clamp(2rem,4vw,3.25rem)] text-bone-50">
        {title}
      </h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <TransitionLink key={a.slug} href={`/insights/${a.slug}`} className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-white/25">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image src={a.image} alt="" fill sizes="(min-width:1024px) 30vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-(--ease-expo) group-hover:scale-[1.05]" />
            </div>
            <div className="p-6">
              <p className="label text-accent-300">
                {a.category} · {a.minutes} min read
              </p>
              <h3 className="mt-3 flex items-start justify-between gap-4 text-[20px] leading-snug font-semibold tracking-tight text-bone-50">
                {a.title}
                <ArrowUpRight className="mt-1 size-5 shrink-0 text-mist-400 transition-all duration-500 group-hover:rotate-45 group-hover:text-accent-300" />
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-400">{a.excerpt}</p>
            </div>
          </TransitionLink>
        ))}
      </div>
    </section>
  );
}
