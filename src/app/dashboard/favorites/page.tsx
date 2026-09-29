import Link from "next/link";
import { requireCustomer } from "@/lib/auth/session";
import { getCatalog } from "@/lib/data/public";
import { startingPrice } from "@/lib/pricing/engine";
import { PageTitle } from "@/components/dashboard/shell";
import { FavoriteToggle } from "@/components/dashboard/client-actions";
import { ServiceIcon } from "@/components/ui/icon";
import { buttonStyles } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Favorite services" };

export default async function FavoritesPage() {
  const { supabase } = await requireCustomer("/dashboard/favorites");
  const [{ data }, catalog] = await Promise.all([supabase.from("customer_favorites").select("service_id"), getCatalog()]);
  const favorites = new Set((data ?? []).map((f) => f.service_id as string));
  const services = catalog.services.filter((s) => s.is_bookable);
  const favSlugs = services.filter((s) => favorites.has(s.id));
  return (
    <div>
      <PageTitle
        title="Favorite services"
        description="Heart the services you order most for one-tap rebooking."
        action={
          favSlugs.length > 0 && (
            <Link href={`/book?service=${favSlugs[0].slug}`} className={buttonStyles({ size: "sm" })}>
              Book my favorites
            </Link>
          )
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <div key={s.id} className="surface flex items-center gap-4 rounded-2xl p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-accent-200">
              <ServiceIcon name={s.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <Link href={`/book?service=${s.slug}`} className="font-medium hover:text-accent-100">
                {s.name}
              </Link>
              <p className="text-[13px] text-mist-500">From {formatMoney(startingPrice(s))}</p>
            </div>
            <FavoriteToggle serviceId={s.id} active={favorites.has(s.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
