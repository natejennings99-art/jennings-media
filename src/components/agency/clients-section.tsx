import type { Client } from "@/lib/types";
import { CLIENT_CATEGORY } from "@/lib/content/work";
import { SectionLabel } from "./section-label";
import { SplitReveal } from "@/components/experience/split-reveal";

/** Every client, laid out as a proper grid — not just a scrolling strip. */
export function ClientsSection({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  return (
    <section className="gutter py-24 sm:py-36" aria-labelledby="clients-title">
      <SectionLabel index="00" className="mb-8">Clients</SectionLabel>
      <SplitReveal as="h2" id="clients-title" className="font-display text-section text-bone-50">
        {clients.length} names
        <br />
        that <span className="text-accent-300">trust us.</span>
      </SplitReveal>
      <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-mist-400">Brokerages, agents, hotels, brands and events across Washington, D.C., Northern Virginia, Maryland and beyond.</p>
      <ul className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3 lg:grid-cols-4">
        {clients.map((c, i) => (
          <li key={c.id} className="group flex min-h-32 flex-col justify-between gap-6 bg-ink-950 p-5 transition-colors duration-500 hover:bg-ink-900 sm:min-h-36 sm:p-6">
            <span className="font-mono text-xs text-mist-600 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="block text-[clamp(1.05rem,1.6vw,1.4rem)] leading-tight font-semibold tracking-tight text-bone-50 transition-colors duration-500 group-hover:text-accent-300">{c.name}</span>
              <span className="label mt-2 block text-mist-500">{CLIENT_CATEGORY[c.name] ?? "Partner"}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
