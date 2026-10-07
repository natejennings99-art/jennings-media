import Image from "next/image";
import { LISTING_REEL_SAMPLES } from "@/lib/content/listing-reel";
import { AmbientVideo } from "@/components/experience/ambient-video";
import { cn } from "@/lib/utils";

/** Three of our own vertical listing reels, looping while on screen. */
export function ListingReelSamples({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3 sm:gap-4", className)}>
      {LISTING_REEL_SAMPLES.map((r, i) => (
        <figure key={r.slug} className={cn("relative aspect-[9/16] overflow-hidden rounded-xl bg-ink-900", i === 1 && "sm:-translate-y-8")}>
          <Image src={`/media/video/${r.slug}.jpg`} alt={`${r.label} — ${r.kind}`} fill sizes="(min-width:1024px) 14vw, 30vw" className="object-cover" />
          <AmbientVideo src={`/media/video/${r.slug}.mp4`} threshold={0.4} className="absolute inset-0 size-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-3 bottom-3">
            <p className="label hidden text-accent-300 sm:block">{r.kind}</p>
            <p className="text-[13px] leading-tight font-semibold tracking-tight text-bone-50 sm:mt-1 sm:text-[15px]">{r.label}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
