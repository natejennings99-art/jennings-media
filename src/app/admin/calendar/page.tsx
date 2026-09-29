import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { addDaysYmd, dayRangeUtc, isYmd, todayYmd } from "@/lib/scheduling/tz";
import { PageTitle } from "@/components/dashboard/shell";
import { AdminCalendar, type CalendarEvent } from "@/components/admin/calendar";

export const metadata = { title: "Calendar" };

export default async function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  const params = (await searchParams) as { date?: string; view?: string };
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const tz = settings.timezone;
  const date = params.date && isYmd(params.date) ? params.date : todayYmd(tz);
  const view = params.view === "day" || params.view === "month" ? params.view : "week";
  const from = dayRangeUtc(addDaysYmd(`${date.slice(0, 7)}-01`, -7), tz).start.toISOString();
  const to = dayRangeUtc(addDaysYmd(`${date.slice(0, 7)}-01`, 45), tz).start.toISOString();
  const [{ data: appts }, { data: blocks }, { data: photographers }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at, ends_at, status, booking_id, photographer:photographers(name, color), booking:bookings(order_number, status, property:properties(address_line1, city))")
      .in("status", ["scheduled", "held", "completed"])
      .gte("starts_at", from)
      .lt("starts_at", to),
    supabase.from("schedule_blocks").select("id, starts_at, ends_at, reason").lt("starts_at", to).gt("ends_at", from),
    supabase.from("photographers").select("id, name, color").eq("is_active", true),
  ]);
  const events: CalendarEvent[] = ((appts ?? []) as unknown as { id: string; starts_at: string; ends_at: string; status: string; booking_id: string; photographer: { name: string; color: string } | null; booking: { order_number: string; status: string; property: { address_line1: string; city: string } } }[]).map((a) => ({
    id: a.id,
    bookingId: a.booking_id,
    start: a.starts_at,
    end: a.ends_at,
    title: a.booking.property.address_line1,
    subtitle: `${a.booking.order_number} · ${a.photographer?.name ?? "Unassigned"}`,
    color: a.photographer?.color ?? "#e6c998",
    held: a.status === "held",
    done: a.status === "completed",
  }));
  return (
    <div>
      <PageTitle title="Calendar" description="Drag a shoot to reschedule it. Clients aren't emailed for drag-and-drop moves." />
      <AdminCalendar
        events={events}
        blocks={(blocks ?? []).map((b) => ({ id: b.id, start: b.starts_at, end: b.ends_at, reason: b.reason }))}
        date={date}
        view={view}
        timezone={tz}
        crew={photographers ?? []}
      />
    </div>
  );
}
