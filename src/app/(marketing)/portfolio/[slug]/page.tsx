import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPortfolio, getPortfolioProject } from "@/lib/data/public";
import { ProjectGallery } from "@/components/marketing/project-gallery";
import { FinalCta } from "@/components/marketing/final-cta";
import { Eyebrow } from "@/components/ui/misc";
import { titleCase } from "@/lib/utils";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { embedUrl } from "@/lib/media-embed";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPortfolio()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Portfolio`,
    description: project.description ?? undefined,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: { images: project.cover_image_url ? [{ url: project.cover_image_url }] : undefined },
  };
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const projects = await getPortfolio();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const video = embedUrl(project.video_url);
  const tour = embedUrl(project.tour_url);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
          { name: project.title, path: `/portfolio/${project.slug}` },
        ])}
      />
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
        {project.cover_image_url && <Image src={project.cover_image_url} alt={project.title} fill priority sizes="100vw" className="-z-20 animate-kenburns object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/30" />
        <div className="container-page pt-40 pb-14">
          <Link href="/portfolio" className="mb-8 inline-flex items-center gap-2 text-sm text-mist-300 transition hover:text-bone-50">
            <ArrowLeft className="size-4" /> Portfolio
          </Link>
          <Eyebrow>{[project.neighborhood, project.property_type].filter(Boolean).join(" · ")}</Eyebrow>
          <h1 className="mt-5 text-[clamp(2.75rem,8vw,7rem)] leading-[0.92] font-medium tracking-[-0.055em]">{project.title}</h1>
          <div className="mt-7 flex flex-wrap gap-2">
            {project.categories.map((c) => (
              <span key={c} className="glass rounded-full px-3 py-1 text-[12.5px] text-bone-100">
                {titleCase(c)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="text-xl leading-relaxed text-bone-100 sm:text-2xl sm:leading-relaxed">{project.description}</p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <p className="eyebrow mb-4">Services performed</p>
          <ul className="space-y-2">
            {project.services_performed.map((s) => (
              <li key={s} className="border-b border-white/[0.07] pb-2 text-[15px] text-mist-300">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {video && (
        <section className="container-page pb-12">
          <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10">
            <iframe src={video} title={`${project.title} film`} className="absolute inset-0 size-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
          </div>
        </section>
      )}

      <section className="container-page pb-12">
        <ProjectGallery media={project.media} title={project.title} />
      </section>

      {tour && (
        <section className="container-page pb-12">
          <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10">
            <iframe src={tour} title={`${project.title} 3D tour`} className="absolute inset-0 size-full" allow="xr-spatial-tracking; fullscreen" allowFullScreen loading="lazy" />
          </div>
        </section>
      )}

      {next && next.slug !== project.slug && (
        <section className="container-page py-12">
          <Link href={`/portfolio/${next.slug}`} className="group relative block overflow-hidden rounded-[32px] border border-white/10">
            <div className="relative aspect-[21/9]">
              {next.cover_image_url && <Image src={next.cover_image_url} alt="" fill sizes="100vw" className="object-cover opacity-60 transition duration-1000 group-hover:scale-105 group-hover:opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-8 sm:p-14">
                <p className="eyebrow">Next project</p>
                <p className="mt-3 flex items-center gap-4 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">
                  {next.title} <ArrowRight className="size-8 transition group-hover:translate-x-2" />
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}
      <FinalCta />
    </>
  );
}
