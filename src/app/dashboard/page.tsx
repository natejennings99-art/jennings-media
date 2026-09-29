import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, ImageDown, Sparkles } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { listCustomerBookings, nextAppointment } from "@/lib/data/customer";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { OrderCard } from "@/components/dashboard/order-card";
import { StatusTracker } from "@/components/dashboard/status-tracker";
import { Card } from "@/components/ui/card";
import { EmptyState, Stat } from "@/components/ui/misc";
import { buttonStyles } from "@/components/ui/button";
import { formatDateTime, formatMoney } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function DashboardHome() {
  const { customer, supabase } = await requireCustomer();
  const [bookings, settings] = await Promise.all([listCustomerBookings(supabase), getSettings()]);
  const active = bookings.filter((b) => !["delivered", "cancelled"].includes(b.status));
  const upcoming = active
    .map((b) => ({ b, appt: nextAppointment(b) }))
    .sort((x, y) => (x.appt?.starts_at ?? "9").localeCompare(y.appt?.starts_at ?? "9"));
  const next = upcoming[0];
  const delivered = bookings.filter((b) => b.status === "delivered");
  const balance = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + Math.max(0, b.total_cents - b.amount_paid_cents), 0);

  return (
    <div className="space-y-10">
      <PageTitle title={`Hi ${customer?.first_name || "there"}`} description="Here's everything happening with your listings." />

      {bookings.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="Your first shoot is two minutes away"
          description="Book online, pick a time and we'll handle the rest. Your orders, media and invoices will live here."
          action={
            <Link href="/book" className={buttonStyles()}>
              Book a shoot <ArrowRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Active orders" value={active.length} sub={`${bookings.length} total`} />
            <Stat label="Delivered" value={delivered.length} sub="Ready to download" />
            <Stat label="Balance due" value={formatMoney(balance, "usd", { exact: true })} sub={balance ? "Pay from Invoices" : "All settled"} />
          </div>

          {next && (
            <Card className="relative overflow-hidden p-6 sm:p-8">
              <div className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-gold-300/10 blur-3xl" />
              <p className="eyebrow">Next up</p>
              <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{next.b.property.address_line1}</p>
                  <p className="mt-1 flex items-center gap-2 text-mist-300">
                    <CalendarDays className="size-4 text-gold-300" />
                    {next.appt ? formatDateTime(next.appt.starts_at, settings.timezone) : "We'll confirm your time shortly"}
                  </p>
                </div>
                <Link href={`/dashboard/orders/${next.b.id}`} className={buttonStyles({ variant: "outline" })}>
                  View shoot <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="mt-8">
                <StatusTracker status={next.b.status} />
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/book", icon: Sparkles, title: "Book another shoot", body: "Your details are saved — it takes a minute." },
              { href: "/dashboard/media", icon: ImageDown, title: "Download media", body: `${delivered.length} delivered order${delivered.length === 1 ? "" : "s"}` },
              { href: "/dashboard/invoices", icon: CreditCard, title: "Invoices & payments", body: balance ? `${formatMoney(balance)} outstanding` : "Everything is paid" },
            ].map((q) => (
              <Link key={q.href} href={q.href} className="surface group flex items-start gap-4 rounded-2xl p-5 transition hover:border-white/20">
                <span className="grid size-10 place-items-center rounded-xl bg-gold-300/10 text-gold-200">
                  <q.icon className="size-4.5" />
                </span>
                <span>
                  <span className="block font-medium">{q.title}</span>
                  <span className="text-[13px] text-mist-400">{q.body}</span>
                </span>
              </Link>
            ))}
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent shoots</h2>
              <Link href="/dashboard/orders" className="text-sm text-gold-200 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {bookings.slice(0, 4).map((b) => (
                <OrderCard key={b.id} booking={b} timezone={settings.timezone} href={`/dashboard/orders/${b.id}`} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
