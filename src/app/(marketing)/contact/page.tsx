import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { getSettings } from "@/lib/data/public";
import { PageIntro } from "@/components/agency/page-intro";
import { SectionLabel } from "@/components/agency/section-label";
import { InquiryForm } from "@/components/agency/inquiry-form";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Start a Project",
  description: `Tell us what you're building. ${BRAND.name} replies to every project inquiry within one business day.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings.email || BRAND.email;
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <PageIntro
        label="Start a project"
        title={
          <>
            Let&rsquo;s build
            <br />
            something worth
            <br />
            <span className="text-accent-300">noticing.</span>
          </>
        }
      >
        Tell us where you are and where you want to be. Two minutes here saves two weeks of back-and-forth.
      </PageIntro>
      <section className="gutter grid gap-16 pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <InquiryForm />
        </div>
        <aside className="space-y-12 lg:col-span-3 lg:col-start-10">
          <div>
            <SectionLabel className="mb-4">Response time</SectionLabel>
            <p className="text-[15.5px] leading-relaxed text-mist-300">Within one business day. Every inquiry is read by a strategist — not a bot.</p>
          </div>
          {email && (
            <div>
              <SectionLabel className="mb-4">Email</SectionLabel>
              <a href={`mailto:${email}`} className="text-lg text-bone-50 hover:text-accent-300">
                {email}
              </a>
            </div>
          )}
          {settings.phone && (
            <div>
              <SectionLabel className="mb-4">Phone</SectionLabel>
              <a href={`tel:${settings.phone}`} className="text-lg text-bone-50 hover:text-accent-300">
                {formatPhone(settings.phone)}
              </a>
            </div>
          )}
          <div>
            <SectionLabel className="mb-4">Studio</SectionLabel>
            <p className="text-[15.5px] text-mist-300">{BRAND.location}</p>
            <p className="text-[15.5px] text-mist-500">{BRAND.locationNote}</p>
          </div>
        </aside>
      </section>
    </>
  );
}
