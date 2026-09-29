import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/ui/misc";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const { q } = (await searchParams) as { q?: string };
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  let query = supabase.from("customers").select("id, first_name, last_name, email, phone, company, brokerage, created_at").order("created_at", { ascending: false }).limit(200);
  const term = q?.trim().replace(/[%,()]/g, "");
  if (term) query = query.or(`email.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%,company.ilike.%${term}%,brokerage.ilike.%${term}%`);
  const [{ data: customers }, { data: stats }] = await Promise.all([query, supabase.from("customer_stats").select("*")]);
  const statMap = new Map((stats ?? []).map((s) => [s.customer_id, s]));
  return (
    <div>
      <PageTitle title="Customers" description="Agents, brokers, managers and investors you work with." />
      <form className="mb-5">
        <input name="q" defaultValue={q} placeholder="Search name, email, company, brokerage…" className="h-10 w-full max-w-sm rounded-full border border-white/10 bg-white/[0.03] px-4 text-sm outline-none focus:border-gold-300/50" />
      </form>
      {(customers ?? []).length === 0 ? (
        <EmptyState title="No customers yet" description="Customers are created automatically when someone books." />
      ) : (
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Company / brokerage</th>
                <th className="px-4 py-3 text-right font-normal">Bookings</th>
                <th className="px-4 py-3 text-right font-normal">Lifetime revenue</th>
                <th className="px-4 py-3 font-normal">Last booking</th>
                <th className="px-4 py-3 font-normal">Next shoot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {(customers ?? []).map((c) => {
                const s = statMap.get(c.id);
                return (
                  <tr key={c.id} className="transition hover:bg-white/[0.025]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-gold-100">
                        {c.first_name} {c.last_name}
                      </Link>
                      <p className="text-[12px] text-mist-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-mist-300">{[c.company, c.brokerage].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s?.bookings_count ?? 0}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatMoney(Number(s?.lifetime_revenue_cents ?? 0))}</td>
                    <td className="px-4 py-3 text-mist-400">{s?.last_booking_at ? formatDate(s.last_booking_at, settings.timezone) : "—"}</td>
                    <td className="px-4 py-3 text-mist-400">{s?.next_appointment_at ? formatDateTime(s.next_appointment_at, settings.timezone) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
