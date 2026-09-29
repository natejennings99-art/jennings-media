import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { listCustomerBookings } from "@/lib/data/customer";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { OrderCard } from "@/components/dashboard/order-card";
import { EmptyState } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Shoots" };

const FILTERS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
] as const;

export default async function OrdersPage({ searchParams }: PageProps<"/dashboard/orders">) {
  const { filter = "upcoming" } = (await searchParams) as { filter?: string };
  const { supabase } = await requireCustomer();
  const [bookings, settings] = await Promise.all([listCustomerBookings(supabase), getSettings()]);
  const shown = bookings.filter((b) =>
    filter === "completed" ? ["delivered", "cancelled"].includes(b.status) : filter === "all" ? true : !["delivered", "cancelled"].includes(b.status)
  );
  return (
    <div>
      <PageTitle title="Shoots" description="Upcoming appointments and completed orders." action={<Link href="/book" className={buttonStyles({ size: "sm" })}>New booking</Link>} />
      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={`/dashboard/orders?filter=${f.key}`} className={cn("h-9 rounded-full px-4 text-[13px] leading-9", filter === f.key ? "bg-bone-50 text-ink-950" : "border border-white/10 text-mist-300")}>
            {f.label}
          </Link>
        ))}
      </div>
      {shown.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((b) => (
            <OrderCard key={b.id} booking={b} timezone={settings.timezone} href={`/dashboard/orders/${b.id}`} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<CalendarCheck className="size-5" />} title={filter === "completed" ? "No completed shoots yet" : "Nothing on the calendar"} action={<Link href="/book" className={buttonStyles()}>Book a shoot</Link>} />
      )}
    </div>
  );
}
