import type { Metadata } from "next";
import Image from "next/image";
import { PageIntro } from "@/components/agency/page-intro";
import { FinalCta } from "@/components/agency/final-cta";

/**
 * DRAFT case study: building tampamaidscleaning.com.
 * Not linked from the nav, not in the sitemap, and noindex until the owner fills in the
 * [ADD …] placeholders and approves it. Facts come from the Tampa Maids repo README and git
 * history (first commit 2026-09-22). Do not add numbers that are not real.
 */
export const metadata: Metadata = {
  title: "Case Study: Tampa Maids Cleaning Website",
  description: "How we built tampamaidscleaning.com for a Tampa house cleaning company: instant prices, online booking, an owner dashboard and lead follow-up.",
  alternates: { canonical: "/case-studies/tampa-maids" },
  robots: { index: false, follow: false },
};

const BUILT: { title: string; body: string }[] = [
  { title: "Instant prices", body: "A /quote page and a price box on the home page give a real price in seconds. The numbers come from one pricing engine that follows the business plan: home size, how often, first-visit deep clean, intro offer, drive-time surcharge and Florida sales tax." },
  { title: "Online booking", body: "A step-by-step booking page: service, home size, how often, extras, a live calendar, then details. Big homes and commercial jobs can ask for a quote on the same page." },
  { title: "Owner dashboard (/owner)", body: "Bookings to confirm, crew to assign, blocked days, revenue and a 7-day forecast. Leads show how long each one has waited and turn red after an hour." },
  { title: "Lead follow-up", body: "Every enquiry gets an automatic reply with the price list and three questions. Day-2 and day-5 reminders are created for each lead, and people who leave the booking form get one email an hour later with a link back to their quote." },
  { title: "Local pages", body: "One page per market (Tampa, St. Petersburg, Clearwater and Sarasota) with its own heading, neighborhoods and schema, plus a sitemap." },
  { title: "Phone app and crew tools", body: "An installable phone app: customers book and track cleans, and the crew see their day, get directions and work a digital checklist." },
  { title: "Hiring and pay", body: "An /apply page feeds a hiring pipeline with phone-screen questions and interview invites. A weekly pay file is ready to upload to Gusto." },
  { title: "Nothing gets lost", body: "Every form post is saved before it is checked, failed emails or texts show as a red banner for the owner, and the database is backed up every night." },
];

export default function TampaMaidsCaseStudy() {
  return (
    <>
      <PageIntro
        label="Case study · Websites & funnels · Tampa"
        title={
          <>
            Tampa Maids
            <br />
            <span className="text-accent-300">Cleaning.</span>
          </>
        }
      >
        A house cleaning company in Tampa Bay needed a site that shows a real price, takes a booking and makes sure no lead is
        missed. We built tampamaidscleaning.com from their business plan, starting in September 2026.
      </PageIntro>

      <section className="gutter pb-20" aria-label="Screenshot">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-ink-900">
          <Image src="/media/work/tampa-maids-home.jpg" alt="Tampa Maids Cleaning home page with the instant price box" fill sizes="100vw" className="object-cover object-top" />
        </div>
      </section>

      <section className="gutter grid gap-12 pb-20 lg:grid-cols-12" aria-labelledby="problem-title">
        <h2 id="problem-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50 lg:col-span-4">The job</h2>
        <div className="space-y-5 text-[17px] leading-relaxed text-mist-300 lg:col-span-8">
          <p>Most cleaning sites make you fill in a form and wait for a call to learn the price. Tampa Maids wanted the price up front, booking online, and a simple screen for the owner to run the day.</p>
          <p>[ADD: one or two sentences from the owner about why they wanted a new site]</p>
        </div>
      </section>

      <section className="gutter pb-20" aria-labelledby="built-title">
        <h2 id="built-title" className="mb-10 font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">What we built</h2>
        <ul className="grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 md:grid-cols-2">
          {BUILT.map((b) => (
            <li key={b.title} className="bg-ink-950 p-6 sm:p-8">
              <h3 className="text-[18px] font-semibold text-bone-50">{b.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mist-300">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="gutter grid gap-12 pb-24 lg:grid-cols-12" aria-labelledby="results-title">
        <h2 id="results-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50 lg:col-span-4">Results</h2>
        <ul className="space-y-4 text-[17px] leading-relaxed text-mist-300 lg:col-span-8">
          <li>Leads in the first [ADD NUMBER] days: [ADD NUMBER]</li>
          <li>Bookings made online: [ADD NUMBER]</li>
          <li>Average time to answer a lead: [ADD NUMBER]</li>
          <li>[ADD REAL REVIEW or quote from the owner]</li>
        </ul>
      </section>

      <FinalCta />
    </>
  );
}
