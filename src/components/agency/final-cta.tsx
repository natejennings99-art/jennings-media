"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/experience/magnetic";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { BRAND } from "@/lib/brand";

const HeroCanvas = dynamic(() => import("@/components/webgl/hero-canvas"), { ssr: false });

export function FinalCta({ title = "Got something ambitious in mind?", kicker = "Let's build it." }: { title?: string; kicker?: string }) {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden" aria-labelledby="cta-title">
      <div className="absolute inset-0 -z-10 bg-ink-950">
        <HeroCanvas className="absolute inset-0 size-full opacity-80" intensity={0.8} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-transparent to-ink-950" />
      </div>
      <div className="gutter w-full py-28 text-center">
        <SplitReveal as="h2" id="cta-title" className="mx-auto max-w-[16ch] font-display text-[clamp(3rem,9vw,9.5rem)] text-bone-50">
          {title}
        </SplitReveal>
        <p className="mt-6 font-display text-[clamp(2rem,5vw,4.5rem)] text-accent-300">{kicker}</p>
        <div className="mt-14 flex justify-center">
          <Magnetic strength={0.4}>
            <TransitionLink
              href="/contact"
              data-cursor="cta"
              className="group grid size-44 place-items-center rounded-full bg-accent-300 text-ink-950 transition-[background-color,transform] duration-500 hover:bg-bone-50 sm:size-56"
            >
              <span className="flex flex-col items-center gap-2 text-[14px] font-bold tracking-[0.12em] uppercase">
                <ArrowUpRight className="size-9 transition-transform duration-500 group-hover:rotate-45" strokeWidth={2} />
                Start a project
              </span>
            </TransitionLink>
          </Magnetic>
        </div>
        <p className="mt-10 text-[15px] text-mist-300">
          Not sure yet?{" "}
          <Link href={BRAND.callHref} className="text-bone-50 underline underline-offset-4 hover:text-accent-300">
            Book a free 15-minute call
          </Link>
        </p>
      </div>
    </section>
  );
}
