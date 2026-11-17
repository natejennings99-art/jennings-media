import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { INDUSTRY_PAGES } from "@/lib/content/industries";
import { CALL } from "@/lib/content/call";
import { PageIntro } from "@/components/agency/page-intro";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Photo & Video by Industry in Tampa Bay",
  description: "Photo, video and social content for restaurants, gyms, realtors, salons, Airbnb hosts and online stores in Tampa, St. Pete and Clearwater.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Industries", path: "/industries" }])} />
      <PageIntro
        label="Who we work with"
        title={
          <>
            Pick your
            <br />
            <span className="text-accent-300">business.</span>
          </>
        }
      >
        We make photos, video and social content for local businesses. Choose yours to see what you get, or{" "}
        <TransitionLink href={CALL.path} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
          book a free 15-minute call
        </TransitionLink>
        .
      </PageIntro>
      <section className="gutter pb-32" aria-label="Industries">
        <ul className="border-t border-white/10">
          {INDUSTRY_PAGES.map((i) => (
            <li key={i.slug} className="border-b border-white/10">
              <TransitionLink href={`/industries/${i.slug}`} className="group flex items-center justify-between gap-6 py-6 sm:py-8">
                <span className="min-w-0">
                  <span className="block font-display text-[clamp(1.75rem,6vw,4.5rem)] break-words text-bone-50 transition-colors duration-500 group-hover:text-accent-300">{i.name}</span>
                  <span className="mt-2 block max-w-xl text-[15px] leading-relaxed text-mist-400">{i.label}</span>
                </span>
                <ArrowUpRight className="size-6 shrink-0 text-mist-600 transition-all duration-500 group-hover:rotate-45 group-hover:text-accent-300 sm:size-8" />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
