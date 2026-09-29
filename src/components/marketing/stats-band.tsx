import { STATS } from "@/lib/content/site";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";

export function StatsBand() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.07] lg:grid-cols-4">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 90} className="bg-ink-950 p-6 sm:p-9">
          <p className="text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-medium tracking-[-0.06em] text-bone-50">
            <CountUp to={s.value} suffix={s.suffix} />
          </p>
          <p className="mt-3 text-[13.5px] text-mist-400 sm:text-sm">{s.label}</p>
        </Reveal>
      ))}
    </div>
  );
}
