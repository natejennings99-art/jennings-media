import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { features } from "@/lib/env";
import { getSettings } from "@/lib/data/public";
import { BRAND } from "@/lib/brand";
import { PageIntro } from "@/components/agency/page-intro";
import { PayForm } from "@/components/agency/pay-form";
import { TransitionLink } from "@/components/experience/transition";

export const metadata: Metadata = {
  title: "Make a payment",
  description: `Pay a ${BRAND.name} invoice, deposit or retainer securely with Stripe.`,
  robots: { index: false },
};

export default async function PayPage({ searchParams }: PageProps<"/pay">) {
  const { status } = await searchParams;
  const settings = await getSettings();
  const email = settings.email || BRAND.email;

  return (
    <>
      <PageIntro
        label="Payments"
        title={
          <>
            Make a <span className="text-accent-300">payment.</span>
          </>
        }
      >
        Pay an invoice, deposit or retainer securely. Your receipt lands in your inbox the moment it goes through.
      </PageIntro>
      <section className="gutter pb-28 sm:pb-40">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {status === "paid" ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 sm:p-10">
                <CheckCircle2 className="size-10 text-accent-300" />
                <h2 className="mt-6 font-display text-[clamp(2rem,4vw,3.25rem)] text-bone-50">Payment received.</h2>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-mist-300">Thank you — a receipt is on its way to your inbox. We&rsquo;ve been notified and will be in touch if anything else is needed.</p>
              </div>
            ) : (
              <PayForm enabled={features.stripe} email={email} cancelled={status === "cancelled"} />
            )}
          </div>
          <aside className="space-y-8 text-[15px] leading-relaxed text-mist-400 lg:col-span-4 lg:col-start-9">
            <div>
              <p className="label mb-3 text-mist-500">Booking a shoot?</p>
              <p>
                Real estate photo, video and drone are booked and paid online —{" "}
                <TransitionLink href="/book" className="text-bone-100 underline-offset-4 hover:text-accent-300 hover:underline">
                  book a shoot
                </TransitionLink>
                .
              </p>
            </div>
            <div>
              <p className="label mb-3 text-mist-500">Questions</p>
              <a href={`mailto:${email}`} className="text-bone-100 hover:text-accent-300">
                {email}
              </a>
            </div>
            <p className="text-[13px] text-mist-600">Payments are processed by Stripe. Card details never touch our servers.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
