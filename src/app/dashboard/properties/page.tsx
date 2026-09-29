import Link from "next/link";
import { Home } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { PROPERTY_TYPE_LABELS } from "@/lib/status";
import { formatDate } from "@/lib/utils";
import type { Property } from "@/lib/types";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const { supabase } = await requireCustomer("/dashboard/properties");
  const { data } = await supabase.from("properties").select("*, bookings(id, created_at, status)").order("created_at", { ascending: false });
  const properties = (data ?? []) as (Property & { bookings: { id: string; created_at: string; status: string }[] })[];
  return (
    <div>
      <PageTitle title="Properties" description="Every address you've booked with us." />
      {properties.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => {
            const latest = [...p.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
            return (
              <div key={p.id} className="surface flex flex-col rounded-3xl p-6">
                <p className="text-lg font-medium">{p.address_line1}</p>
                <p className="text-sm text-mist-400">
                  {p.city}, {p.state} {p.postal_code}
                </p>
                <p className="mt-3 text-[13px] text-mist-500">
                  {PROPERTY_TYPE_LABELS[p.property_type]}
                  {p.square_feet ? ` · ${p.square_feet.toLocaleString()} sq ft` : ""}
                  {p.bedrooms ? ` · ${p.bedrooms} bd` : ""}
                  {p.bathrooms ? ` · ${p.bathrooms} ba` : ""}
                </p>
                <p className="mt-1 text-[13px] text-mist-500">
                  {p.bookings.length} shoot{p.bookings.length === 1 ? "" : "s"}
                  {latest && ` · last ${formatDate(latest.created_at)}`}
                </p>
                <div className="mt-5 flex gap-2">
                  {latest && (
                    <Link href={`/dashboard/orders/${latest.id}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
                      Latest order
                    </Link>
                  )}
                  <Link href="/book" className={buttonStyles({ size: "sm" })}>
                    Rebook
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Home className="size-5" />} title="No properties yet" />
      )}
    </div>
  );
}
