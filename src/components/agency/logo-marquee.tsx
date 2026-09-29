import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./section-label";

const WORDMARK_STYLES = [
  "font-display text-[1.6rem] tracking-[-0.03em]",
  "font-serif text-[1.75rem] italic font-light [font-family:Georgia,serif]",
  "font-mono text-[1.15rem] font-semibold uppercase tracking-[0.2em]",
  "text-[1.7rem] font-black tracking-[-0.06em] lowercase",
  "text-[1.35rem] font-medium uppercase tracking-[0.34em] [font-variation-settings:'wdth'_75]",
];

export function LogoMarquee({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const row = (
    <ul className="flex shrink-0 items-center">
      {clients.map((c, i) => (
        <li key={c.id} className="flex h-20 items-center px-10 text-bone-50/45 transition-colors duration-300 hover:text-bone-50 sm:px-14">
          {c.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.logo_url} alt={c.name} loading="lazy" className="h-8 w-auto opacity-70 brightness-0 invert transition-opacity hover:opacity-100" />
          ) : (
            <span className={cn("whitespace-nowrap", WORDMARK_STYLES[i % WORDMARK_STYLES.length])}>{c.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Clients" className="border-y border-white/[0.07] py-10">
      <SectionLabel className="gutter mb-6">Trusted by ambitious brands</SectionLabel>
      <div className="group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee group-hover:[animation-duration:120s]" style={{ ["--marquee-duration" as string]: "55s" }}>
          {row}
          <div aria-hidden className="flex">
            {row}
          </div>
        </div>
      </div>
    </section>
  );
}
