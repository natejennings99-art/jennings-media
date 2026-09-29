import Link from "next/link";
import { ImageDown } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";
import { MEDIA_CATEGORY_META } from "@/lib/status";

export const metadata = { title: "Media downloads" };

export default async function MediaPage() {
  const { supabase } = await requireCustomer("/dashboard/media");
  const { data } = await supabase
    .from("bookings")
    .select("id, order_number, delivered_at, property:properties(address_line1, city), media(category)")
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false });
  const rows = (data ?? []) as unknown as { id: string; order_number: string; delivered_at: string; property: { address_line1: string; city: string }; media: { category: string }[] }[];
  return (
    <div>
      <PageTitle title="Media downloads" description="Every delivered gallery, film, floor plan and tour." />
      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const counts = r.media.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.category]: (acc[m.category] ?? 0) + 1 }), {});
            return (
              <Link key={r.id} href={`/dashboard/orders/${r.id}`} className="surface rounded-3xl p-6 transition hover:border-white/20">
                <p className="font-mono text-[11px] text-mist-500">{r.order_number}</p>
                <p className="mt-1 text-lg font-medium">{r.property.address_line1}</p>
                <p className="text-sm text-mist-400">
                  {r.property.city} · delivered {formatDate(r.delivered_at)}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {Object.entries(counts).map(([k, n]) => (
                    <span key={k} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] text-mist-300">
                      {n} {MEDIA_CATEGORY_META[k]?.label.toLowerCase() ?? k}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<ImageDown className="size-5" />} title="No deliveries yet" description="Finished media shows up here the moment it's delivered." />
      )}
    </div>
  );
}
