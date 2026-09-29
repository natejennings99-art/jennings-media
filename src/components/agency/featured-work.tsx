import { ArrowUpRight } from "lucide-react";
import type { PortfolioProject } from "@/lib/types";
import { SplitReveal } from "@/components/experience/split-reveal";
import { TransitionLink } from "@/components/experience/transition";
import { Reveal } from "@/components/motion/reveal";
import { CaseCard, type CaseLayout } from "./case-card";
import { SectionLabel } from "./section-label";

const LAYOUTS: CaseLayout[] = ["left", "right", "full", "split"];

export function FeaturedWork({ projects }: { projects: PortfolioProject[] }) {
  if (projects.length === 0) return null;
  const featured = projects.slice(0, 4);
  return (
    <section className="py-24 sm:py-36" aria-labelledby="work-title">
      <div className="gutter mb-16 flex flex-col justify-between gap-8 sm:mb-24 lg:flex-row lg:items-end">
        <div>
          <SectionLabel index="02" className="mb-8">Case studies</SectionLabel>
          <SplitReveal as="h2" id="work-title" className="font-display text-section text-bone-50">
            Selected work
          </SplitReveal>
        </div>
        <TransitionLink href="/work" className="group inline-flex items-center gap-2 self-start text-[14px] font-semibold tracking-[0.06em] text-bone-50 uppercase lg:self-auto">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
            All projects
          </span>
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
        </TransitionLink>
      </div>
      <div className="space-y-28 sm:space-y-40">
        {featured.map((p, i) => (
          <Reveal key={p.id} className={LAYOUTS[i] === "full" ? undefined : "gutter"}>
            <CaseCard project={p} layout={LAYOUTS[i] ?? "left"} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
