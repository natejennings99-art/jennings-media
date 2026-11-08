import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { JOIN_DETAILS, JOIN_HOW_IT_WORKS, JOIN_LOOKING_FOR } from "@/lib/content/creators";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { JoinForm } from "@/components/agency/join-form";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Join: Photographers & Videographers",
  description: `Photographers and videographers in Tampa Bay and DC: shoot real estate, short-form video and events with ${BRAND.name}. Paid trial shoot, no exclusivity.`,
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Join", path: "/join" }])} />
      <PageIntro
        label="For photographers & videographers"
        title={
          <>
            Shoot with
            <br />
            <span className="text-accent-300">Jennings Media.</span>
          </>
        }
        aside={
          <a href="#apply" className="group inline-flex h-15 items-center gap-3 rounded-full bg-accent-300 pr-2 pl-7 text-[14px] font-semibold tracking-[0.04em] text-ink-950 uppercase transition-colors hover:bg-bone-50">
            Apply in two minutes
            <span className="grid size-11 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-5" />
            </span>
          </a>
        }
      >
        We take on more shoots than one camera can cover. If you shoot real estate, short-form video or events in Tampa Bay or the DC area, send us your work. Good fit means a paid trial shoot, then steady work at your rate.
      </PageIntro>

      <section className="gutter grid gap-14 pb-24 lg:grid-cols-12 lg:gap-10" aria-labelledby="looking-title">
        <div className="lg:col-span-7">
          <SectionLabel index="01" className="mb-6">
            What we shoot
          </SectionLabel>
          <h2 id="looking-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Three kinds of work, all of it paid.
          </h2>
          <ul className="mt-10 grid gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {JOIN_LOOKING_FOR.map((a) => (
              <li key={a.title}>
                <p className="text-[18px] font-semibold tracking-tight text-bone-50">{a.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <SectionLabel index="02" className="mb-6">
            The details
          </SectionLabel>
          <ul className="space-y-4">
            {JOIN_DETAILS.map((f) => (
              <li key={f} className="flex gap-3 text-[16px] leading-snug text-mist-300">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
              </li>
            ))}
          </ul>
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
          {JOIN_HOW_IT_WORKS.map((s, i) => (
            <li key={s.title}>
              <p className="font-mono text-sm text-accent-300">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold tracking-tight text-bone-50">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="apply" className="gutter grid scroll-mt-28 gap-16 pb-32 lg:grid-cols-12" aria-labelledby="apply-title">
        <div className="lg:col-span-8">
          <SectionLabel index="04" className="mb-6">
            Apply
          </SectionLabel>
          <h2 id="apply-title" className="mb-12 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            Show us your work.
          </h2>
          <JoinForm />
        </div>
        <aside className="space-y-12 lg:col-span-3 lg:col-start-10 lg:pt-40">
          <div>
            <SectionLabel className="mb-4">Rather text?</SectionLabel>
            <a href={BRAND.phoneHref.replace(/^tel:/, "sms:")} className="text-lg text-bone-50 hover:text-accent-300">
              {BRAND.phone}
            </a>
          </div>
          {BRAND.email && (
            <div>
              <SectionLabel className="mb-4">Email</SectionLabel>
              <a href={`mailto:${BRAND.email}?subject=${encodeURIComponent("Creator application")}`} className="text-lg break-all text-bone-50 hover:text-accent-300">
                {BRAND.email}
              </a>
            </div>
          )}
          <div>
            <SectionLabel className="mb-4">Where</SectionLabel>
            <p className="text-[15.5px] text-mist-300">{BRAND.location}</p>
            <p className="text-[15.5px] text-mist-500">Other cities as the work comes up.</p>
          </div>
        </aside>
      </section>
    </>
  );
}
