import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

export const metadata = { title: "Media" };

type Row = { id: string; order_number: string; status: BookingStatus; delivered_at: string | null; updated_at: string; property: { address_line1: string; city: string }; media: { id: string }[] };

function MediaTable({ items, timezone }: { items: Row[]; timezone: string }) {
  return (
    <div className="surface divide-y divide-white/[0.05] overflow-hidden rounded-2xl">
      {items.map((r) => (
        <Link key={r.id} href={`/admin/bookings/${r.id}#media`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-white/[0.025]">
          <span>
            <span className="font-mono text-[12px] text-mist-500">{r.order_number}</span> {r.property.address_line1}, {r.property.city}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-mist-400">{r.media.length} files</span>
            <StatusBadge status={r.status} />
            <span className="w-24 text-right text-[12px] text-mist-500">{formatDate(r.delivered_at ?? r.updated_at, timezone)}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function AdminMediaPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data } = await supabase
    .from("bookings")
    .select("id, order_number, status, delivered_at, updated_at, property:properties(address_line1, city), media(id)")
    .in("status", ["scheduled", "shoot_completed", "editing", "ready_for_delivery", "delivered"])
    .order("updated_at", { ascending: false })
    .limit(120);
  const rows = (data ?? []) as unknown as Row[];
  const queue = rows.filter((r) => r.status !== "delivered");
  const delivered = rows.filter((r) => r.status === "delivered");
  return (
    <div className="space-y-8">
      <PageTitle title="Media" description="Upload and deliver from each booking. Files live in private storage." />
      <section>
        <h2 className="mb-3 text-lg font-medium">Delivery queue</h2>
        {queue.length ? <MediaTable items={queue} timezone={settings.timezone} /> : <EmptyState title="Nothing waiting on delivery" className="py-10" />}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-medium">Recently delivered</h2>
        {delivered.length ? <MediaTable items={delivered.slice(0, 40)} timezone={settings.timezone} /> : <EmptyState title="No deliveries yet" className="py-10" />}
      </section>
    </div>
  );
}
