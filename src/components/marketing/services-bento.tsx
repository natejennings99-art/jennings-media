import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney, cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/icon";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";

const HOME_ORDER: { slug: string; label?: string }[] = [
  { slug: "photography" },
  { slug: "cinematic-video" },
  { slug: "drone-photography", label: "Drone Photography & Video" },
  { slug: "matterport-3d-tour" },
  { slug: "floor-plans" },
  { slug: "virtual-twilight" },
  { slug: "property-website" },
  { slug: "social-media-reel", label: "Social Media Reels" },
  { slug: "marketing-kit", label: "Marketing Kits" },
];

// Bento spans for a 12-column grid (desktop).
const SPANS = [
  "lg:col-span-7 lg:row-span-2 min-h-[26rem] lg:min-h-[36rem]",
  "lg:col-span-5 min-h-[17rem]",
  "lg:col-span-5 min-h-[17rem]",
  "lg:col-span-4 min-h-[20rem]",
  "lg:col-span-4 min-h-[20rem]",
  "lg:col-span-4 min-h-[20rem]",
  "lg:col-span-4 min-h-[18rem]",
  "lg:col-span-4 min-h-[18rem]",
  "lg:col-span-4 min-h-[18rem]",
];

export function ServicesBento({ services }: { services: Service[] }) {
  const items = HOME_ORDER.map((o) => {
    const s = services.find((x) => x.slug === o.slug);
    return s ? { ...s, displayName: o.label ?? s.name } : null;
  }).filter((x): x is Service & { displayName: string } => Boolean(x));

  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12">
      {items.map((s, i) => (
        <Reveal key={s.id} delay={(i % 3) * 90} className={cn("sm:col-span-1", i === 0 && "sm:col-span-2", SPANS[i])}>
          <Spotlight className="group relative h-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-ink-900 transition-[border-color,transform] duration-500 ease-(--ease-expo) hover:-translate-y-1 hover:border-white/20">
            <Link href={`/services/${s.slug}`} className="absolute inset-0 z-20" aria-label={`${s.displayName} — details`} />
            {s.image_url && (
              <Image
                src={s.image_url}
                alt=""
                fill
                sizes={i === 0 ? "(min-width:1024px) 58vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"}
                className="object-cover opacity-70 transition-[transform,opacity] duration-[1200ms] ease-(--ease-expo) group-hover:scale-[1.06] group-hover:opacity-90"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
              <div className="flex items-start justify-between">
                <span className="glass grid size-11 place-items-center rounded-2xl text-gold-200">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                <span className="grid size-10 translate-x-2 -translate-y-2 place-items-center rounded-full bg-bone-50 text-ink-950 opacity-0 transition-all duration-500 ease-(--ease-expo) group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="size-4.5" />
                </span>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-gold-200/80 uppercase">
                  From {formatMoney(startingPrice(s))}
                  {s.pricing_model === "per_unit" && s.unit_label ? ` / ${s.unit_label}` : ""}
                </p>
                <h3 className={cn("mt-2 font-medium tracking-[-0.035em] text-bone-50", i === 0 ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl")}>
                  {s.displayName}
                </h3>
                <p className={cn("mt-2 max-w-md text-[14.5px] leading-relaxed text-mist-300", i !== 0 && "line-clamp-2")}>{s.tagline}</p>
              </div>
            </div>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}
