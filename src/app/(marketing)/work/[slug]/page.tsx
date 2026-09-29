import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getPortfolio } from "@/lib/data/public";
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/types";
import { embedUrl } from "@/lib/media-embed";
import { BRAND } from "@/lib/brand";
import { SplitReveal } from "@/components/experience/split-reveal";
import { Parallax, ClipReveal } from "@/components/experience/parallax";
import { TransitionLink } from "@/components/experience/transition";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { JsonLd, breadcrumbSchema, caseStudySchema } from "@/components/seo/json-ld";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPortfolio()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getPortfolio()).find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: !p.client_name || p.client_name === p.title ? p.title : `${p.title} — ${p.client_name}`,
    description: p.summary ?? p.description ?? undefined,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { images: p.cover_image_url ? [{ url: p.cover_image_url }] : undefined },
  };
}

function Chapter({ index, title, text }: { index: string; title: string; text: string | null }) {
  if (!text) return null;
  return (
    <div className="grid gap-6 border-t border-white/10 py-12 sm:py-16 lg:grid-cols-12">
      <p className="label text-mist-500 lg:col-span-3">
        <span className="text-accent-300">({index})</span> {title}
      </p>
      <SplitReveal as="p" className="text-[clamp(1.35rem,2.4vw,2.1rem)] leading-[1.3] font-medium tracking-[-0.02em] text-bone-50 lg:col-span-8 lg:col-start-5">
        {text}
      </SplitReveal>
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const projects = await getPortfolio();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const p = projects[index];
  const next = projects[(index + 1) % projects.length];
  const gallery = p.media.filter((m) => m.kind !== "video");
  const video = embedUrl(p.video_url);
  const file = !video && p.video_url ? p.video_url : null;

  return (
    <article>
      <JsonLd data={[caseStudySchema(p), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: p.title, path: `/work/${p.slug}` }])]} />
      <header className="gutter pt-36 sm:pt-48">
        <SectionLabel className="mb-8 animate-fade-in">Case study — {p.client_name ?? p.title}</SectionLabel>
        <SplitReveal as="h1" immediate className="max-w-[18ch] font-display text-[clamp(2.75rem,8vw,8.5rem)] text-bone-50">
          {p.headline ?? p.title}
        </SplitReveal>
        <dl className="mt-14 grid animate-fade-up grid-cols-2 gap-8 border-t border-white/10 pt-8 [animation-delay:500ms] lg:grid-cols-4">
          {[
            ["Client", p.client_name ?? "—"],
            ["Industry", p.industry ?? "—"],
            ["Services", p.services_performed.join(", ") || "—"],
            ["Year", p.year ? String(p.year) : "—"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="label text-mist-500">{k}</dt>
              <dd className="mt-2 text-[15px] text-bone-100">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {p.cover_image_url && (
        <Parallax className="mt-16 aspect-[4/5] w-full sm:mt-24 sm:aspect-[21/10]" amount={8}>
          <Image src={p.cover_image_url} alt={p.title} fill priority sizes="100vw" className="object-cover" />
        </Parallax>
      )}

      <section className="gutter py-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <SectionLabel className="lg:col-span-3">Overview</SectionLabel>
          <p className="text-[clamp(1.5rem,3vw,2.6rem)] leading-[1.2] font-medium tracking-[-0.03em] text-bone-50 lg:col-span-9">{p.summary ?? p.description}</p>
        </div>
        {p.metrics.length > 0 && (
          <dl className="mt-16 grid gap-px overflow-hidden rounded-md bg-white/10 sm:grid-cols-3">
            {p.metrics.map((m) => (
              <div key={m.label} className="bg-ink-950 p-8 sm:p-10">
                <dd className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none text-accent-300">{m.value}</dd>
                <dt className="mt-4 text-[15px] text-mist-300">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="gutter">
        <Chapter index="01" title="Challenge" text={p.challenge} />
        <Chapter index="02" title="Strategy" text={p.strategy} />
        <Chapter index="03" title="Creative execution" text={p.execution} />
      </section>

      {video && (
        <section className="gutter py-16">
          <div className="relative aspect-video overflow-hidden rounded-md">
            <iframe src={video} title={`${p.title} film`} className="absolute inset-0 size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        </section>
      )}

      {file && (
        <section className="gutter py-16" aria-label="Film preview">
          <div className="flex justify-center overflow-hidden rounded-md bg-ink-900">
            <video src={file} poster={file.startsWith("/media/") ? file.replace(/\.mp4$/, ".jpg") : undefined} autoPlay muted loop playsInline controls className="max-h-[85svh] w-auto max-w-full" />
          </div>
          <p className="label mt-4 text-center text-mist-500">
            Preview —{" "}
            <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="text-bone-100 underline-offset-4 hover:text-accent-300 hover:underline">
              full cut on Instagram
            </a>
          </p>
        </section>
      )}

      {gallery.length > 0 && (
        <section className="py-16 sm:py-24" aria-label="Campaign assets">
          <SectionLabel className="gutter mb-10">Campaign assets</SectionLabel>
          <div className="space-y-4 sm:space-y-6">
            {gallery.map((m, i) =>
              i % 3 === 0 ? (
                <ClipReveal key={m.id}>
                  <div className="relative aspect-[4/5] w-full sm:aspect-[16/8]">
                    <Image src={m.url} alt={m.alt ?? p.title} fill sizes="100vw" className="object-cover" />
                  </div>
                </ClipReveal>
              ) : i % 3 === 1 ? (
                <div key={m.id} className="gutter grid gap-4 sm:grid-cols-2 sm:gap-6">
                  {[m, gallery[i + 1]].filter(Boolean).map((g) => (
                    <ClipReveal key={g.id}>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-md">
                        <Image src={g.url} alt={g.alt ?? p.title} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" />
                      </div>
                    </ClipReveal>
                  ))}
                </div>
              ) : null
            )}
          </div>
        </section>
      )}

      {(p.results || p.metrics.length > 0) && (
        <section className="gutter py-20 sm:py-32">
          <SectionLabel className="mb-8">Results</SectionLabel>
          {p.results && (
            <SplitReveal as="p" className="max-w-[22ch] font-display text-[clamp(2.25rem,5vw,5rem)] text-bone-50">
              {p.results}
            </SplitReveal>
          )}
          <div className="mt-12 flex flex-wrap gap-x-16 gap-y-8">
            {p.categories.map((c) => (
              <span key={c} className="label text-mist-400">
                {PORTFOLIO_CATEGORY_LABELS[c as keyof typeof PORTFOLIO_CATEGORY_LABELS] ?? c}
              </span>
            ))}
          </div>
        </section>
      )}

      {p.testimonial_quote && (
        <section className="gutter py-20 sm:py-32">
          <figure className="border-y border-white/10 py-16 sm:py-24">
            <blockquote className="font-display text-[clamp(2rem,5vw,5rem)] leading-[0.98] text-bone-50">
              <span className="text-accent-300">&ldquo;</span>
              {p.testimonial_quote}
              <span className="text-accent-300">&rdquo;</span>
            </blockquote>
            <figcaption className="mt-10 flex items-center gap-4 text-[15px]">
              <span className="h-px w-10 bg-accent-300" />
              <span className="font-semibold">{p.testimonial_author}</span>
              <span className="text-mist-400">{p.testimonial_role}</span>
            </figcaption>
          </figure>
        </section>
      )}

      {next && next.slug !== p.slug && (
        <TransitionLink href={`/work/${next.slug}`} data-cursor="view" data-cursor-label="Next" className="group relative block overflow-hidden">
          <div className="relative aspect-[4/5] w-full sm:aspect-[21/9]">
            {next.cover_image_url && <Image src={next.cover_image_url} alt="" fill sizes="100vw" className="object-cover opacity-50 transition-[transform,opacity] duration-[1400ms] ease-(--ease-expo) group-hover:scale-105 group-hover:opacity-70" />}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="gutter absolute inset-x-0 bottom-0 pb-12 sm:pb-16">
              <p className="label text-mist-300">Next project — {next.client_name}</p>
              <p className="mt-4 flex items-start gap-4 font-display text-[clamp(2.5rem,7vw,7rem)] text-bone-50">
                {next.title}
                <ArrowUpRight className="mt-[0.08em] size-[0.7em] shrink-0 text-accent-300 transition-transform duration-500 group-hover:rotate-45" strokeWidth={2.5} />
              </p>
            </div>
          </div>
        </TransitionLink>
      )}
      <FinalCta title="Want results like these?" kicker="Start here." />
    </article>
  );
}
