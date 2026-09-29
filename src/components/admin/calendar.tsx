"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysYmd, weekdayOfYmd, zonedParts, zonedTimeToUtc, ymdOf } from "@/lib/scheduling/tz";
import { useToast } from "@/components/ui/toast";
import { moveAppointment } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  bookingId: string;
  start: string;
  end: string;
  title: string;
  subtitle: string;
  color: string;
  held: boolean;
  done: boolean;
}

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT_MIN = 15;
const PX_PER_MIN = 1.1;

function Chip({ ev, compact, timezone, dragging, onDrag }: { ev: CalendarEvent; compact?: boolean; timezone: string; dragging: boolean; onDrag: (id: string | null) => void }) {
  return (
    <Link
      href={`/admin/bookings/${ev.bookingId}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", ev.id);
        onDrag(ev.id);
      }}
      onDragEnd={() => onDrag(null)}
      className={cn("block cursor-grab overflow-hidden rounded-lg border-l-[3px] bg-white/[0.07] px-2 py-1 text-[11.5px] leading-tight transition hover:bg-white/[0.12] active:cursor-grabbing", ev.held && "opacity-60", ev.done && "opacity-50", dragging && "ring-1 ring-accent-300")}
      style={{ borderColor: ev.color }}
      title={`${ev.title} — ${ev.subtitle}`}
    >
      <span className="font-mono text-mist-300">{new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(ev.start))}</span>{" "}
      <span className="text-bone-50">{ev.title}</span>
      {!compact && <span className="block truncate text-mist-500">{ev.subtitle}</span>}
    </Link>
  );
}

export function AdminCalendar({
  events,
  blocks,
  date,
  view,
  timezone,
  crew,
}: {
  events: CalendarEvent[];
  blocks: { id: string; start: string; end: string; reason: string | null }[];
  date: string;
  view: "day" | "week" | "month";
  timezone: string;
  crew: { id: string; name: string; color: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const today = ymdOf(new Date(), timezone);

  const nav = (d: string, v = view) => router.push(`/admin/calendar?date=${d}&view=${v}`);
  const step = view === "month" ? 30 : view === "week" ? 7 : 1;
  const weekStart = addDaysYmd(date, -weekdayOfYmd(date));
  const days = view === "day" ? [date] : Array.from({ length: 7 }, (_, i) => addDaysYmd(weekStart, i));
  const localParts = (iso: string) => zonedParts(new Date(iso), timezone);
  const eventsOn = (ymd: string) => events.filter((e) => ymdOf(new Date(e.start), timezone) === ymd).sort((a, b) => a.start.localeCompare(b.start));

  function drop(eventId: string, ymd: string, minutes: number | null) {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;
    const p = localParts(ev.start);
    const mins = minutes ?? p.hour * 60 + p.minute;
    const hm = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const iso = zonedTimeToUtc(ymd, hm, timezone).toISOString();
    if (iso === new Date(ev.start).toISOString()) return;
    start(async () => {
      const res = await moveAppointment(eventId, iso);
      toast(res.ok ? { tone: "success", title: "Shoot rescheduled" } : { tone: "error", title: res.error });
      router.refresh();
    });
  }

  const label =
    view === "month"
      ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
      : view === "week"
        ? `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${days[0]}T00:00:00Z`))} – ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${days[6]}T00:00:00Z`))}`
        : new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

  return (
    <div className={cn(pending && "opacity-70")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => nav(addDaysYmd(date, -step))} className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/5" aria-label="Previous">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => nav(today)} className="h-9 rounded-full border border-white/10 px-4 text-sm hover:bg-white/5">
            Today
          </button>
          <button type="button" onClick={() => nav(addDaysYmd(date, step))} className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/5" aria-label="Next">
            <ChevronRight className="size-4" />
          </button>
          <p className="ml-2 font-medium">{label}</p>
        </div>
        <div className="flex rounded-full border border-white/10 p-1">
          {(["day", "week", "month"] as const).map((v) => (
            <button key={v} type="button" onClick={() => nav(date, v)} className={cn("h-8 rounded-full px-4 text-[13px] capitalize", view === v ? "bg-bone-50 text-ink-950" : "text-mist-400")}>
              {v}
            </button>
          ))}
        </div>
      </div>
      {crew.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 text-[12px] text-mist-400">
          {crew.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: c.color }} /> {c.name}
            </span>
          ))}
        </div>
      )}

      {view === "month" ? (
        <div className="surface overflow-hidden rounded-2xl">
          <div className="grid grid-cols-7 border-b border-white/[0.07] text-center text-[11px] tracking-wide text-mist-500 uppercase">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <span key={d} className="py-2">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {(() => {
              const first = `${date.slice(0, 7)}-01`;
              const gridStart = addDaysYmd(first, -weekdayOfYmd(first));
              return Array.from({ length: 42 }, (_, i) => addDaysYmd(gridStart, i)).map((d) => {
                const inMonth = d.slice(0, 7) === date.slice(0, 7);
                const blocked = blocks.some((b) => ymdOf(new Date(b.start), timezone) <= d && ymdOf(new Date(new Date(b.end).getTime() - 1), timezone) >= d);
                return (
                  <div
                    key={d}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => drop(e.dataTransfer.getData("text/plain"), d, null)}
                    className={cn("min-h-28 border-r border-b border-white/[0.05] p-1.5", !inMonth && "bg-black/20", blocked && "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgb(255_255_255/0.03)_6px,rgb(255_255_255/0.03)_12px)]")}
                  >
                    <button type="button" onClick={() => nav(d, "day")} className={cn("mb-1 grid size-6 place-items-center rounded-full text-[12px]", d === today ? "bg-accent-300 text-ink-950" : inMonth ? "text-mist-300" : "text-mist-600")}>
                      {Number(d.slice(8))}
                    </button>
                    <div className="space-y-1">
                      {eventsOn(d).slice(0, 4).map((ev) => (
                        <Chip key={ev.id} ev={ev} compact timezone={timezone} dragging={dragId === ev.id} onDrag={setDragId} />
                      ))}
                      {eventsOn(d).length > 4 && <p className="px-1 text-[11px] text-mist-500">+{eventsOn(d).length - 4} more</p>}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      ) : (
        <div className="surface overflow-x-auto rounded-2xl">
          <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0,1fr))` }}>
            <div />
            {days.map((d) => (
              <button key={d} type="button" onClick={() => nav(d, "day")} className={cn("border-b border-l border-white/[0.06] py-2 text-center text-[12px]", d === today ? "text-accent-200" : "text-mist-400")}>
                {new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`))}
              </button>
            ))}
            <div className="relative">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <div key={i} className="pr-2 text-right text-[10.5px] text-mist-600" style={{ height: 60 * PX_PER_MIN }}>
                  {new Intl.DateTimeFormat("en-US", { hour: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, START_HOUR + i)))}
                </div>
              ))}
            </div>
            {days.map((d) => (
              <div key={d} className="relative border-l border-white/[0.06]" style={{ height: (END_HOUR - START_HOUR) * 60 * PX_PER_MIN }}>
                {Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MIN }, (_, i) => (
                  <div
                    key={i}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => drop(e.dataTransfer.getData("text/plain"), d, START_HOUR * 60 + i * SLOT_MIN)}
                    className={cn("border-white/[0.04]", i % 4 === 0 && "border-t")}
                    style={{ height: SLOT_MIN * PX_PER_MIN }}
                  />
                ))}
                {blocks
                  .filter((b) => ymdOf(new Date(b.start), timezone) <= d && ymdOf(new Date(new Date(b.end).getTime() - 1), timezone) >= d)
                  .map((b) => (
                    <div key={b.id} className="pointer-events-none absolute inset-x-0 top-0 bottom-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgb(255_255_255/0.04)_6px,rgb(255_255_255/0.04)_12px)]">
                      <span className="m-1 inline-block rounded bg-ink-950/70 px-1.5 text-[10.5px] text-mist-400">{b.reason ?? "Blocked"}</span>
                    </div>
                  ))}
                {eventsOn(d).map((ev) => {
                  const s = localParts(ev.start);
                  const top = ((s.hour - START_HOUR) * 60 + s.minute) * PX_PER_MIN;
                  const height = Math.max(26, ((new Date(ev.end).getTime() - new Date(ev.start).getTime()) / 60000) * PX_PER_MIN);
                  return (
                    <div key={ev.id} className="absolute inset-x-1 z-10" style={{ top: Math.max(0, top), height }}>
                      <div className="h-full [&>a]:h-full">
                        <Chip ev={ev} timezone={timezone} dragging={dragId === ev.id} onDrag={setDragId} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
