import type { Metadata } from "next";
import Image from "next/image";
import { Check, Zap } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { FinalCta } from "@/components/marketing/final-cta";
import { StatsBand } from "@/components/marketing/stats-band";
import { Reveal } from "@/components/motion/reveal";
import { Accent, SectionHeading } from "@/components/ui/misc";
import { ABOUT } from "@/lib/content/site";
import { IMAGES } from "@/lib/content/images";

export const metadata: Metadata = {
  title: "About",
  description: "Jennings Media helps real estate professionals market properties better with premium photography, video, drone and 3D media.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title={<>We make listings <Accent>impossible</Accent> to scroll past.</>} description={ABOUT.mission} image={IMAGES.heroInterior} />

      <section className="container-page py-16">
        <StatsBand />
      </section>

      <section className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Our mission" title={<>Great media is the <Accent>first showing.</Accent></>} />
        </div>
        <div className="space-y-5 text-lg leading-relaxed text-mist-300 lg:col-span-6 lg:col-start-7">
          <p>{ABOUT.mission}</p>
          <p>We built Jennings Media for agents, brokers, property managers, developers, hosts and investors who need consistent, premium visuals on a real-estate timeline — booked in minutes, captured on schedule, delivered by morning.</p>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Our process" title="Plan. Capture. Craft. Deliver." className="mb-12" />
        <div className="grid gap-4 md:grid-cols-4">
          {ABOUT.process.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <div className="surface h-full rounded-[26px] p-7">
                <p className="font-mono text-sm text-gold-300">0{i + 1}</p>
                <p className="mt-8 text-2xl font-medium tracking-[-0.03em]">{step.title}</p>
                <p className="mt-2 text-[15px] text-mist-400">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2">
        <Reveal variant="scale">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10">
            <Image src={IMAGES.cameraGear} alt="Professional camera equipment" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </Reveal>
        <div>
          <SectionHeading eyebrow="Professional equipment" title="Pro-grade tools on every shoot" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {ABOUT.equipment.map((e) => (
              <li key={e} className="flex items-start gap-3 text-[15px] text-bone-100">
                <Check className="mt-0.5 size-4 shrink-0 text-gold-300" /> {e}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page grid gap-4 py-16 md:grid-cols-2">
        <div className="surface rounded-[30px] p-8 sm:p-10">
          <Zap className="size-6 text-gold-300" />
          <p className="mt-6 text-3xl font-medium tracking-[-0.04em]">Fast turnaround</p>
          <p className="mt-3 text-[15.5px] leading-relaxed text-mist-400">Photos by 9 AM the next morning. Films, reels and 3D tours within 48 hours. Same-day rush when the listing can&rsquo;t wait.</p>
        </div>
        <div className="surface rounded-[30px] p-8 sm:p-10">
          <Check className="size-6 text-gold-300" />
          <p className="mt-6 text-3xl font-medium tracking-[-0.04em]">Quality standards</p>
          <ul className="mt-4 space-y-2 text-[15.5px] text-mist-400">
            {ABOUT.standards.map((s) => (
              <li key={s}>· {s}</li>
            ))}
          </ul>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
