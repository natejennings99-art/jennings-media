import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite CSS marquee. Children are duplicated for a seamless loop. */
export function Marquee({
  children,
  reverse,
  duration = 45,
  className,
  pauseOnHover = true,
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]", className)}>
      <div
        className={cn(
          "flex w-max shrink-0",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function WordMarquee({ words }: { words: readonly string[] }) {
  return (
    <section aria-label="What we create" className="border-y border-white/[0.06] bg-ink-950 py-7 sm:py-9">
      <Marquee duration={50}>
        {words.map((word) => (
          <span key={word} className="flex items-center">
            <span className="px-6 text-[clamp(1.6rem,4vw,3.25rem)] font-medium tracking-[-0.04em] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgb(247_244_238/0.35)] transition-colors duration-500 hover:text-bone-50 sm:px-10">
              {word}
            </span>
            <span className="text-xl text-gold-300">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
