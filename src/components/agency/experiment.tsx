"use client";

import dynamic from "next/dynamic";
import { SectionLabel } from "./section-label";

const AttentionField = dynamic(() => import("@/components/webgl/attention-field"), { ssr: false });

export function Experiment() {
  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="experiment-title">
      <div className="gutter grid gap-6 sm:grid-cols-2 sm:items-end">
        <div>
          <SectionLabel index="07" className="mb-6">Experiment</SectionLabel>
          <h2 id="experiment-title" className="font-display text-[clamp(2rem,4.5vw,4rem)] text-bone-50">
            Attention is a force.
          </h2>
        </div>
        <p className="label text-mist-400 sm:text-right">
          <span className="hidden sm:inline">Move your cursor through it</span>
          <span className="sm:hidden">Tap to disturb it</span>
        </p>
      </div>
      <div className="mt-8 h-[46svh] min-h-[280px] w-full sm:h-[62vh]">
        <AttentionField className="size-full font-sans" />
      </div>
      <p className="gutter mt-6 max-w-xl text-[15px] leading-relaxed text-mist-400">
        Six thousand points, one word. The same idea runs through every campaign we build: create a reaction, then let it resolve into something people remember.
      </p>
    </section>
  );
}
