/**
 * "From" prices for marketing copy, read from the same catalog the pricing page and checkout use,
 * so every page quotes the same floor. Packages and most services scale with home size, so copy
 * always says "from".
 */
import type { Catalog } from "@/lib/types";
import { startingPrice } from "@/lib/pricing/engine";
import { formatMoney } from "@/lib/utils";

const min = (xs: number[]) => (xs.length ? Math.min(...xs) : null);

export function priceSummary(catalog: Pick<Catalog, "services" | "packages">) {
  const bookable = catalog.services.filter((s) => s.is_bookable);
  const from = (pred: (s: (typeof bookable)[number]) => boolean) => min(bookable.filter(pred).map((s) => startingPrice(s)).filter((n) => n > 0));
  const packages = catalog.packages.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order);
  const photo = from((s) => s.slug === "photography") ?? from((s) => s.category === "photography");
  const film = from((s) => s.slug === "cinematic-video");
  const reel = from((s) => s.slug === "social-media-reel");
  const drone = from((s) => s.category === "drone");
  const pkg = min(packages.map((p) => startingPrice(p)).filter((n) => n > 0));
  const money = (c: number | null) => (c ? formatMoney(c) : null);
  const parts = [photo && `Photos from ${money(photo)}`, pkg && `packages from ${money(pkg)}`].filter(Boolean) as string[];
  return {
    photo,
    film,
    reel,
    drone,
    pkg,
    packages,
    money,
    /** e.g. "Photos from $175 · packages from $250" */
    line: parts.join(" · "),
    /** e.g. "Essential from $250 · Pro from $450 · Signature from $650" */
    packageLine: packages.map((p) => `${p.name} from ${formatMoney(startingPrice(p))}`).join(" · "),
  };
}
