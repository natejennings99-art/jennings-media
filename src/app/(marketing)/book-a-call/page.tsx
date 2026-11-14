import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { CALL } from "@/lib/content/call";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { CallForm } from "@/components/agency/call-form";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Book a Free 15-Minute Call",
  description: `Book a free 15-minute call with ${BRAND.name}. Tell us what you need: photo, video or social content. Nate calls you back within one business day.`,
  alternates: { canonical: CALL.path },
};

export default function BookACallPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Book a call", path: CALL.path }])} />
      <PageIntro
        label="Free 15-minute call"
        title={
          <>
            Book a
            <br />
            <span className="text-accent-300">call.</span>
          </>
        }
      >
        Not sure what you need yet? That&rsquo;s fine. Leave your number and a good time, and Nate calls you. Or skip the form:{" "}
        <a href={BRAND.phoneHref} className="whitespace-nowrap text-bone-50 underline underline-offset-4 hover:text-accent-300">
          call or text {BRAND.phone}
        </a>
        .
      </PageIntro>

      <section id="book" className="gutter grid scroll-mt-28 gap-14 pb-24 lg:grid-cols-12" aria-labelledby="book-title">
        <div className="lg:col-span-7">
          <SectionLabel index="01" className="mb-6">
            Your details
          </SectionLabel>
          <h2 id="book-title" className="mb-10 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Three things. Nate calls you.
          </h2>
          <CallForm />
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
          <div>
            <SectionLabel className="mb-4">Already know what you need?</SectionLabel>
            <TransitionLink href="/contact" className="text-[15.5px] text-bone-50 underline underline-offset-4 hover:text-accent-300">
              Send a project brief instead
            </TransitionLink>
          </div>
        </aside>
      </section>

      <section className="gutter pb-32" aria-labelledby="call-how-title">
        <SectionLabel index="02" className="mb-6">
          How it works
        </SectionLabel>
        <h2 id="call-how-title" className="sr-only">
          How the call works
        </h2>
        <ol className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
          {CALL.steps.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
