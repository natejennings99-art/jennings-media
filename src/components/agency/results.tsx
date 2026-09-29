import type { MarketingStat } from "@/lib/types";
import { Counter } from "@/components/experience/counter";
import { SplitReveal } from "@/components/experience/split-reveal";
import { SectionLabel } from "./section-label";

export function Results({ stats }: { stats: MarketingStat[] }) {
  if (stats.length === 0) return null;
  return (
    <section className="gutter py-24 sm:py-36" aria-labelledby="results-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionLabel index="03" className="mb-8">Results</SectionLabel>
          <SplitReveal as="h2" id="results-title" className="font-display text-section text-bone-50">
            Creative that <span className="text-accent-300">performs.</span>
          </SplitReveal>
        </div>
        <p className="max-w-md self-end text-[16px] leading-relaxed text-mist-400 lg:col-span-4 lg:col-start-9">
          Every brief starts with a number. We make the work beautiful — and we make it accountable.
        </p>
      </div>
      <dl className="mt-16 grid grid-cols-1 border-t border-white/10 sm:mt-24 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="border-b border-white/10 py-10 sm:px-6 sm:first:pl-0 lg:border-b-0 lg:border-l lg:first:border-l-0 lg:py-14">
            <dt className="label text-mist-500">0{i + 1}</dt>
            <dd className="mt-6 font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-none text-bone-50">
              <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals ?? 0} />
            </dd>
            <dd className="mt-4 text-[15px] text-mist-400">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
