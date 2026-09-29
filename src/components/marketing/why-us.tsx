import { BadgeCheck, CalendarCheck, Layers, Megaphone, Plane, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { WHY_US } from "@/lib/content/site";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { Accent, SectionHeading } from "@/components/ui/misc";

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  sparkles: Sparkles,
  calendar: CalendarCheck,
  layers: Layers,
  plane: Plane,
  "badge-check": BadgeCheck,
  megaphone: Megaphone,
};

export function WhyUs() {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            eyebrow="Why Jennings Media"
            title={
              <>
                Built for agents who <Accent>can&rsquo;t</Accent> wait.
              </>
            }
            description="Listing media is a deadline business. We designed every step — booking, capture, editing, delivery — around speed without cutting corners."
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-8">
        {WHY_US.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Sparkles;
          return (
            <Reveal key={item.title} delay={(i % 2) * 100} className={i === WHY_US.length - 1 ? "sm:col-span-2" : undefined}>
              <Spotlight className="surface group h-full rounded-[26px] p-7 transition-colors duration-500 hover:border-white/15">
                <span className="grid size-12 place-items-center rounded-2xl border border-gold-300/20 bg-gold-300/[0.08] text-gold-200 transition-transform duration-500 ease-(--ease-spring) group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 text-xl font-medium tracking-[-0.03em] text-bone-50">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mist-400">{item.body}</p>
              </Spotlight>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
