"use client";

import Link from "next/link";
import { useState } from "react";
import type { Package, Service } from "@/lib/types";
import { packagePrice, servicePrice, startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";

/** Whole square feet from what was typed ("2,400" → 2400), or null when empty or not a number. */
export function parseSqft(raw: string): number | null {
  const n = Number(raw.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : null;
}

/** Exact package prices for one home size, straight from the catalog and pricing engine. "From" prices when no size is given. */
export function sqftPrices(packages: Package[], photo: Service | undefined, sqft: number | null) {
  return {
    packages: packages.map((p) => ({ slug: p.slug, name: p.name, cents: sqft ? packagePrice(p, sqft) : startingPrice(p) })),
    photo: photo ? (sqft ? servicePrice(photo, sqft) : startingPrice(photo)) : null,
  };
}

/** /book while online booking is off: type the home size, see the exact package prices, pick one to request. */
export function SqftPrice({ packages, photo, selected, initialSqft }: { packages: Package[]; photo?: Service; selected?: string; initialSqft?: string }) {
  const [raw, setRaw] = useState(initialSqft ?? "");
  const sqft = parseSqft(raw);
  const prices = sqftPrices(packages, photo, sqft);
  const from = sqft ? "" : "from ";
  return (
    <div className="mt-8">
      <label className="block max-w-xs">
        <span className="label text-mist-400">Home size (sq ft)</span>
        <input
          inputMode="numeric"
          autoComplete="off"
          value={raw}
          onChange={(e) => setRaw(e.target.value.slice(0, 7))}
          placeholder="e.g. 2,400"
          className="w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[17px] text-bone-50 placeholder:text-mist-600 focus:border-accent-300 focus:ring-0 focus:outline-none"
        />
      </label>
      {prices.packages.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Packages" aria-live="polite">
          {prices.packages.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/book?package=${p.slug}${sqft ? `&sqft=${sqft}` : ""}#request`}
                className={`flex h-full flex-col gap-1 rounded-md border px-4 py-3 hover:border-accent-300 ${p.slug === selected ? "border-accent-300" : "border-white/10"}`}
              >
                <span className="text-[15px] font-semibold text-bone-50">{p.name}</span>
                <span className="text-[14px] text-mist-300">
                  {from}
                  {formatMoney(p.cents)}
                </span>
                <span className="mt-1 text-[13px] text-accent-300 underline underline-offset-4">Request this</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[13px] text-mist-500">
        {prices.photo ? `Photos only: ${from}${formatMoney(prices.photo)}. ` : ""}Travel fee, if any, confirmed by text.
      </p>
    </div>
  );
}
