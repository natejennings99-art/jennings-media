import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { getServiceAreas, getSettings } from "@/lib/data/public";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import { Accent } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about real estate photography, video, drone or 3D tours? Contact Jennings Media — we reply within one business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { reason } = (await searchParams) as { reason?: string };
  const [settings, areas] = await Promise.all([getSettings(), getServiceAreas()]);
  const cities = [...new Set(areas.flatMap((a) => a.cities))].slice(0, 14);
  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&rsquo;s talk about your <Accent>next listing.</Accent></>} description="Custom projects, team pricing or a quick question — send a note and a real person will reply within one business day." />
      <section className="container-page grid gap-6 pb-24 lg:grid-cols-12">
        <div className="surface rounded-[30px] p-6 sm:p-10 lg:col-span-8">
          <ContactForm defaultReason={reason} />
        </div>
        <div className="space-y-4 lg:col-span-4">
          <div className="surface space-y-4 rounded-[26px] p-6 text-[15px]">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-mist-300 hover:text-bone-50">
                <Mail className="size-4.5 text-gold-300" /> {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-mist-300 hover:text-bone-50">
                <Phone className="size-4.5 text-gold-300" /> {formatPhone(settings.phone)}
              </a>
            )}
            <p className="flex items-center gap-3 text-mist-300">
              <Clock className="size-4.5 text-gold-300" /> Replies within 1 business day
            </p>
          </div>
          {cities.length > 0 && (
            <div className="surface rounded-[26px] p-6">
              <p className="flex items-center gap-2 font-medium">
                <MapPin className="size-4 text-gold-300" /> Service area
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-mist-400 capitalize">{cities.join(" · ")}</p>
            </div>
          )}
          <div className="rounded-[26px] border border-gold-300/25 bg-gold-300/[0.07] p-6">
            <p className="font-medium">Ready to book?</p>
            <p className="mt-1 text-sm text-mist-300">Skip the back-and-forth — see live availability and pricing.</p>
            <Link href="/book" className={buttonStyles({ className: "mt-4" })}>
              Book a Shoot <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
