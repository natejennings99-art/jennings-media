import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";
import { features } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { BRAND } from "@/lib/brand";
import { PACKAGES, RETAINERS, findPlan, formatPlanPrice, type Plan } from "@/lib/content/plans";
import { cn } from "@/lib/utils";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { FinalCta } from "@/components/agency/final-cta";
import { TransitionLink } from "@/components/experience/transition";
import { JsonLd, breadcrumbSchema, offerCatalogSchema } from "@/components/seo/json-ld";
import { checkoutPlan } from "./actions";

export const metadata: Metadata = {
  title: "Pricing: Marketing Retainers & Packages",
  alternates: { canonical: "/plans" },
  description: `Monthly growth retainers and fixed-price packages from ${BRAND.name}: lead generation, Meta & Google Ads, AI agents, content and brand films.`,
};

function PlanCard({ plan, enabled }: { plan: Plan; enabled: boolean }) {
  return (
    <form action={checkoutPlan} className={cn("relative flex flex-col rounded-lg border p-7 sm:p-8", plan.recommended ? "border-accent-300/60 bg-accent-300/[0.06]" : "border-white/10 bg-white/[0.02]")}>
      <input type="hidden" name="plan" value={plan.slug} />
      {plan.recommended && <span className="label absolute -top-3 left-7 rounded-full bg-accent-300 px-3 py-1 text-ink-950">Recommended</span>}
      <p className="font-display text-[1.75rem] text-bone-50">{plan.name}</p>
      <p className="mt-2 min-h-12 text-[15px] leading-relaxed text-mist-400">{plan.tagline}</p>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-[clamp(2.5rem,4vw,3.25rem)] text-bone-50">{formatPlanPrice(plan)}</span>
        <span className="label text-mist-500">{plan.interval ? "/ month" : "one-time"}</span>
      </p>
      <ul className="mt-7 flex-1 space-y-3 border-t border-white/10 pt-7">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-3 text-[15px] leading-snug text-mist-300">
            <Check className="mt-0.5 size-4 shrink-0 text-accent-300" /> {f}
          </li>
        ))}
      </ul>
      <button
        type="submit"
        disabled={!enabled}
        data-cursor="cta"
        className={cn(
          "group mt-8 inline-flex h-13 items-center justify-between rounded-full pr-1.5 pl-6 text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          plan.recommended ? "bg-accent-300 text-ink-950 hover:bg-bone-50" : "bg-bone-50 text-ink-950 hover:bg-accent-300"
        )}
      >
        {plan.interval ? `Start ${plan.name}` : "Buy package"}
        <span className="grid size-10 place-items-center rounded-full bg-ink-950 text-bone-50 transition-transform duration-500 group-hover:rotate-45">
          <ArrowUpRight className="size-4" />
        </span>
      </button>
    </form>
  );
}

export default async function PlansPage({ searchParams }: PageProps<"/plans">) {
  const { status, plan: planSlug } = await searchParams;
  const settings = await getSettings();
  const email = settings.email || BRAND.email;
  const bought = status === "success" ? findPlan(typeof planSlug === "string" ? planSlug : undefined) : null;
  const portal = process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL || "";
  const notice =
    status === "success"
      ? `You're in${bought ? ` — ${bought.name}` : ""}. A receipt is on its way and we'll reach out within one business day to kick off.`
      : status === "cancelled"
        ? "Checkout was cancelled — nothing was charged."
        : status === "unavailable" || !features.stripe
          ? `Online checkout is being switched on. Until then, email ${email} and we'll send your payment link.`
          : status === "error"
            ? "Something went wrong starting checkout. Please try again."
            : null;

  return (
    <>
      <JsonLd data={[offerCatalogSchema([...RETAINERS, ...PACKAGES]), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/plans" }])]} />
      <PageIntro
        label="Pricing"
        title={
          <>
            Simple plans.
            <br />
            <span className="text-accent-300">Serious growth.</span>
          </>
        }
      >
        Monthly retainers when you want a growth team — fixed-price packages when you need one job done right. Ad spend is paid straight to Meta and Google.
      </PageIntro>

      <section className="gutter pb-20" aria-labelledby="retainers-title">
        {notice && <p className={cn("mb-10 rounded-md border px-5 py-4 text-[15px]", status === "success" ? "border-accent-300/40 bg-accent-300/10 text-bone-50" : "border-white/10 bg-white/[0.03] text-mist-300")}>{notice}</p>}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel className="mb-5">Monthly retainers</SectionLabel>
            <h2 id="retainers-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
              Your growth team, on retainer.
            </h2>
          </div>
          <p className="max-w-sm text-[15px] text-mist-400">Month to month, billed securely by Stripe. Upgrade, downgrade or cancel from your billing portal.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {RETAINERS.map((p) => (
            <PlanCard key={p.slug} plan={p} enabled={features.stripe} />
          ))}
        </div>
      </section>

      <section className="gutter pb-24 sm:pb-32" aria-labelledby="packages-title">
        <div className="mb-10 border-t border-white/10 pt-16">
          <SectionLabel className="mb-5">Packages</SectionLabel>
          <h2 id="packages-title" className="font-display text-[clamp(2rem,4vw,3.5rem)] text-bone-50">
            One job. Fixed price.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PACKAGES.map((p) => (
            <PlanCard key={p.slug} plan={p} enabled={features.stripe} />
          ))}
        </div>
        <div className="mt-14 grid gap-6 text-[15px] text-mist-400 sm:grid-cols-3">
          <p>
            Need something bigger or custom?{" "}
            <TransitionLink href="/contact" className="text-bone-100 underline-offset-4 hover:text-accent-300 hover:underline">
              Let&rsquo;s talk
            </TransitionLink>
            .
          </p>
          <p>
            Real estate photo, video and drone?{" "}
            <TransitionLink href="/book" className="text-bone-100 underline-offset-4 hover:text-accent-300 hover:underline">
              Book a shoot
            </TransitionLink>
            .
          </p>
          {portal ? (
            <p>
              Already a client?{" "}
              <a href={portal} className="text-bone-100 underline-offset-4 hover:text-accent-300 hover:underline">
                Manage your plan
              </a>
              .
            </p>
          ) : (
            <p>
              Questions?{" "}
              <a href={`mailto:${email}`} className="text-bone-100 hover:text-accent-300">
                {email}
              </a>
            </p>
          )}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
