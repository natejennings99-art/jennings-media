import { Plus } from "lucide-react";

export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map((item) => (
        <details key={item.q} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-medium tracking-[-0.02em] text-bone-50 transition hover:text-accent-100 sm:text-lg">
            {item.q}
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 text-mist-300 transition-transform duration-500 ease-(--ease-expo) group-open:rotate-45 group-open:border-accent-300/40 group-open:text-accent-200">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-[15.5px] leading-relaxed text-mist-400">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
