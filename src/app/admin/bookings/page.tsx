import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { StatusBadge, PaymentBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { BOOKING_STATUSES, type BookingStatus, type PaymentStatus } from "@/lib/types";
import { BOOKING_STATUS_META } from "@/lib/status";
import { cn, formatDateTime, formatMoney, formatDate } from "@/lib/utils";

export const metadata = { title: "Bookings" };

type Row = {
  id: string; order_number: string; status: BookingStatus; payment_status: PaymentStatus; total_cents: number; created_at: string;
  customer: { first_name: string; last_name: string; email: string }; property: { address_line1: string; city: string };
  appointments: { starts_at: string; status: string }[];
};

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const params = (await searchParams) as { status?: string; q?: string; page?: string };
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const page = Math.max(1, Number(params.page) || 1);
  const size = 30;
  let query = supabase
    .from("bookings")
    .select("id, order_number, status, payment_status, total_cents, created_at, customer:customers!inner(first_name, last_name, email), property:properties!inner(address_line1, city), appointments(starts_at, status)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (params.status && (BOOKING_STATUSES as readonly string[]).includes(params.status)) query = query.eq("status", params.status);
  else if (params.status === "active") query = query.not("status", "in", "(delivered,cancelled)");
  const q = params.q?.trim().replace(/[%,()]/g, "");
  if (q) query = /^JM-/i.test(q) ? query.ilike("order_number", `${q}%`) : query.or(`address_line1.ilike.%${q}%,city.ilike.%${q}%`, { referencedTable: "properties" });
  const { data, count } = await query;
  const rows = (data ?? []) as unknown as Row[];
  const tabs = [{ key: "active", label: "Active" }, ...BOOKING_STATUSES.map((s) => ({ key: s, label: BOOKING_STATUS_META[s].label })), { key: "all", label: "All" }];
  const current = params.status ?? "all";

  return (
    <div>
      <PageTitle title="Bookings" description={`${count ?? 0} bookings`} />
      <form className="mb-4">
        <input type="hidden" name="status" value={params.status ?? ""} />
        <input name="q" defaultValue={params.q} placeholder="Search address, city or JM-order…" className="h-10 w-full max-w-sm rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm outline-none focus:border-accent-300/50" />
      </form>
      <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto">
        {tabs.map((t) => (
          <Link key={t.key} href={`/admin/bookings?status=${t.key === "all" ? "" : t.key}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={cn("h-8 shrink-0 rounded-full px-3.5 text-[12.5px] leading-8", current === t.key || (t.key === "all" && !params.status) ? "bg-bone-50 text-ink-950" : "border border-white/10 text-mist-400 hover:text-bone-50")}>
            {t.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No bookings match" />
      ) : (
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Property</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Appointment</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((b) => {
                const appt = b.appointments.filter((a) => a.status !== "cancelled").sort((x, y) => x.starts_at.localeCompare(y.starts_at))[0];
                return (
                  <tr key={b.id} className="transition hover:bg-white/[0.025]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="font-mono text-[12.5px] text-accent-200 hover:underline">
                        {b.order_number}
                      </Link>
                      <p className="text-[11.5px] text-mist-600">{formatDate(b.created_at, settings.timezone)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="hover:text-accent-100">
                        {b.property.address_line1}
                      </Link>
                      <p className="text-[12px] text-mist-500">{b.property.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      {b.customer.first_name} {b.customer.last_name}
                      <p className="text-[12px] text-mist-500">{b.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-mist-300">{appt ? formatDateTime(appt.starts_at, settings.timezone) : <span className="text-amber-200">Unscheduled</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={b.status} />
                        <PaymentBadge status={b.payment_status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(b.total_cents, "usd", { exact: true })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {(count ?? 0) > size && (
        <div className="mt-5 flex justify-end gap-2 text-sm">
          {page > 1 && <Link href={`/admin/bookings?status=${params.status ?? ""}&page=${page - 1}`} className="rounded-full border border-white/10 px-4 py-2">Previous</Link>}
          {page * size < (count ?? 0) && <Link href={`/admin/bookings?status=${params.status ?? ""}&page=${page + 1}`} className="rounded-full border border-white/10 px-4 py-2">Next</Link>}
        </div>
      )}
    </div>
  );
}
