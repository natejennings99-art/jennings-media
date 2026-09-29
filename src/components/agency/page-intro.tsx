import type { ReactNode } from "react";
import { SplitReveal } from "@/components/experience/split-reveal";
import { SectionLabel } from "./section-label";

/** Oversized page header used across the agency pages. */
export function PageIntro({ label, title, children, aside }: { label: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <section className="gutter pt-36 pb-16 sm:pt-48 sm:pb-24">
      <SectionLabel className="mb-8 animate-fade-in">{label}</SectionLabel>
      <SplitReveal as="h1" immediate className="font-display text-hero text-bone-50">
        {title}
      </SplitReveal>
      {(children || aside) && (
        <div className="mt-12 grid gap-8 sm:mt-16 lg:grid-cols-12 lg:items-end">
          <div className="max-w-xl animate-fade-up text-[17px] leading-relaxed text-mist-300 [animation-delay:500ms] lg:col-span-6">{children}</div>
          {aside && <div className="animate-fade-up [animation-delay:650ms] lg:col-span-6 lg:justify-self-end">{aside}</div>}
        </div>
      )}
    </section>
  );
}
