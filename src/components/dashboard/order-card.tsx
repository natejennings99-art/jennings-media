import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { BookingSummary } from "@/lib/data/customer";
import { nextAppointment } from "@/lib/data/customer";
import { StatusBadge } from "@/components/ui/badge";
import { StatusTracker } from "./status-tracker";
import { formatCalendarDate, formatDateTime, formatMoney } from "@/lib/utils";

export function OrderCard({ booking, timezone, href }: { booking: BookingSummary; timezone: string; href: string }) {
  const appt = nextAppointment(booking);
  const services = booking.items.filter((i) => i.item_type !== "fee" && !i.included_in_package).map((i) => i.name);
  return (
    <Link href={href} className="surface group block rounded-3xl p-5 transition hover:border-white/20 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[11px] text-mist-500">
            {booking.order_number}
          </p>
          <p className="mt-1.5 flex items-center gap-2 truncate text-lg font-medium tracking-[-0.02em] text-bone-50">
            <MapPin className="size-4 shrink-0 text-gold-300" />
            <span className="truncate">{booking.property.address_line1}</span>
          </p>
          <p className="mt-0.5 text-[13px] text-mist-400">
            {booking.property.city}, {booking.property.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
          <ArrowUpRight className="size-4 text-mist-500 transition group-hover:text-bone-50" />
        </div>
      </div>
      <div className="mt-5">
        <StatusTracker status={booking.status} compact />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-mist-400">
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          {appt ? formatDateTime(appt.starts_at, timezone) : booking.preferred_date ? `Requested ${formatCalendarDate(booking.preferred_date)}` : "Scheduling"}
        </span>
        <span className="truncate">{services.slice(0, 3).join(" · ")}</span>
        <span className="font-medium text-bone-100 tabular-nums">{formatMoney(booking.total_cents, booking.currency, { exact: true })}</span>
      </div>
    </Link>
  );
}
