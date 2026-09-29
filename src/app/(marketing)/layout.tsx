import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { MobileBookBar } from "@/components/marketing/mobile-book-bar";
import { getCatalog } from "@/lib/data/public";
import { formatMoney } from "@/lib/utils";

export default async function MarketingLayout({ children }: LayoutProps<"/">) {
  const catalog = await getCatalog();
  const from = Math.min(...catalog.packages.map((p) => Math.min(p.base_price_cents, ...p.price_tiers.map((t) => t.price_cents))));
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <MobileBookBar fromPrice={Number.isFinite(from) ? formatMoney(from) : "Book online"} />
    </>
  );
}
