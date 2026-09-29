import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { PROPERTY_TYPE_LABELS } from "@/lib/status";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("properties").select("id, address_line1, city, state, property_type, square_feet, customer:customers(id, first_name, last_name), bookings(id, created_at)").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as unknown as { id: string; address_line1: string; city: string; state: string; property_type: string; square_feet: number | null; customer: { id: string; first_name: string; last_name: string }; bookings: { id: string; created_at: string }[] }[];
  return (
    <div>
      <PageTitle title="Properties" description="Every address photographed." />
      <div className="surface overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-normal">Address</th>
              <th className="px-4 py-3 font-normal">Type</th>
              <th className="px-4 py-3 text-right font-normal">Sq ft</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 text-right font-normal">Shoots</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {rows.map((p) => {
              const latest = [...p.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
              return (
                <tr key={p.id} className="hover:bg-white/[0.025]">
                  <td className="px-4 py-3">
                    {latest ? <Link href={`/admin/bookings/${latest.id}`} className="hover:text-accent-100">{p.address_line1}</Link> : p.address_line1}
                    <p className="text-[12px] text-mist-500">{p.city}, {p.state}</p>
                  </td>
                  <td className="px-4 py-3 text-mist-300">{PROPERTY_TYPE_LABELS[p.property_type]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.square_feet?.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${p.customer.id}`} className="hover:text-accent-100">{p.customer.first_name} {p.customer.last_name}</Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.bookings.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
