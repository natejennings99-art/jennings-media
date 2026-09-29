import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="container-page max-w-3xl pt-36 pb-24">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 text-5xl font-medium tracking-[-0.05em]">{title}</h1>
      <p className="mt-3 text-sm text-mist-500">Last updated {updated}</p>
      <div className="mt-10 space-y-5 text-[15.5px] leading-relaxed text-mist-300 [&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-bone-50 [&_strong]:text-bone-100">
        {children}
      </div>
    </section>
  );
}
