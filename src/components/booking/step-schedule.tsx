"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Loader2, Moon, Sun, Sunset } from "lucide-react";
import type { DayAvailability, Slot } from "@/lib/scheduling/availability";
import { cn } from "@/lib/utils";
import { StepHeader } from "./primitives";
import type { DraftSlot } from "./types";

interface AvailabilityResponse {
  onSite: boolean;
  timezone: string;
  durationMinutes: number;
  rules: { daylight_only: boolean; twilight: boolean; min_notice_hours: number; skills: string[] };
  days: DayAvailability[];
}

const WINDOW_RANGES: Record<string, [number, number]> = { morning: [8, 11], midday: [11, 14], afternoon: [14, 18] };

function monthStart(ymd: string) {
  return `${ymd.slice(0, 7)}-01`;
}
function shiftMonth(ymd: string, delta: number) {
  const [y, m] = ymd.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}
function daysInMonth(ymd: string) {
  const [y, m] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function StepSchedule({
  request,
  slot,
  preferredDate,
  arrivalWindow,
  today,
  requestWithoutSlot,
  onSelect,
  onRequestWithoutSlot,
  onOnSiteChange,
  error,
}: {
  request: object;
  slot: DraftSlot | null;
  preferredDate: string;
  arrivalWindow: string;
  today: string;
  requestWithoutSlot: boolean;
  onSelect: (slot: DraftSlot | null) => void;
  onRequestWithoutSlot: (value: boolean) => void;
  onOnSiteChange: (onSite: boolean) => void;
  error?: string;
}) {
  const initialMonth = monthStart(slot?.date ?? (preferredDate && preferredDate >= today ? preferredDate : today));
  const [month, setMonth] = useState(initialMonth);
  const [result, setResult] = useState<{ key: string; data: AvailabilityResponse | null; failed: boolean } | null>(null);
  const [pickedDay, setDay] = useState<string | null>(slot?.date ?? (preferredDate >= today ? preferredDate || null : null));
  const requestKey = JSON.stringify(request);
  const fetchKey = `${month}|${requestKey}|${today}`;
  const loading = result?.key !== fetchKey;
  const data = result?.data ?? null;
  const failed = !loading && Boolean(result?.failed);

  useEffect(() => {
    const controller = new AbortController();
    const from = month <= monthStart(today) ? today : month;
    const days = daysInMonth(month) - Number(from.slice(8)) + 1;
    fetch("/api/booking/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...JSON.parse(requestKey), from, days }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((json: AvailabilityResponse) => {
        setResult({ key: fetchKey, data: json, failed: false });
        onOnSiteChange(json.onSite);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setResult({ key: fetchKey, data: null, failed: true });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const byDate = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d])), [data]);
  // Fall back to the first open day in view when nothing (bookable) is picked.
  const day = pickedDay && byDate.get(pickedDay)?.slots.length ? pickedDay : (data?.days.find((d) => d.slots.length)?.date ?? pickedDay);
  const selectedDay = day ? byDate.get(day) : undefined;

  if (data && !data.onSite) {
    return (
      <div>
        <StepHeader eyebrow="Step 5 · Schedule" title="No site visit needed" description="Everything in this order is produced by our studio team — there's nothing to schedule. We'll start as soon as you book." />
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 p-5 text-sm text-mist-300">
          <CalendarClock className="size-5 text-gold-300" /> Continue to your details.
        </div>
      </div>
    );
  }

  const offset = new Date(`${month}T00:00:00Z`).getUTCDay();
  const cells = Array.from({ length: offset + daysInMonth(month) }, (_, i) => (i < offset ? null : `${month.slice(0, 8)}${String(i - offset + 1).padStart(2, "0")}`));
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}T00:00:00Z`));
  const tz = data?.timezone;
  const hourOf = (iso: string) => Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date(iso)));
  const inWindow = (s: Slot) => {
    const r = WINDOW_RANGES[arrivalWindow];
    if (!r) return false;
    const h = hourOf(s.start);
    return h >= r[0] && h < r[1];
  };
  const groups = selectedDay
    ? [
        { key: "morning", label: "Morning", icon: Sun, slots: selectedDay.slots.filter((s) => s.kind === "standard" && hourOf(s.start) < 12) },
        { key: "afternoon", label: "Afternoon", icon: Sunset, slots: selectedDay.slots.filter((s) => s.kind === "standard" && hourOf(s.start) >= 12) },
        { key: "twilight", label: "Twilight", icon: Moon, slots: selectedDay.slots.filter((s) => s.kind === "twilight") },
      ].filter((g) => g.slots.length)
    : [];
  const noAvailability = data && data.days.every((d) => d.slots.length === 0);

  return (
    <div>
      <StepHeader
        eyebrow="Step 5 · Schedule"
        title="Pick a date and time"
        description={
          data?.rules.twilight
            ? "Twilight sessions are timed automatically to each day's sunset."
            : `About ${Math.round((data?.durationMinutes ?? 60) / 15) * 15} minutes on site. Times shown in ${tz?.replace("_", " ") ?? "local time"}.`
        }
      />
      {error && <p className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={month <= monthStart(today)} className="grid size-10 place-items-center rounded-full border border-white/10 text-mist-300 hover:text-bone-50 disabled:opacity-30" aria-label="Previous month">
              <ChevronLeft className="size-4" />
            </button>
            <p className="font-medium">{monthLabel}</p>
            <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} className="grid size-10 place-items-center rounded-full border border-white/10 text-mist-300 hover:text-bone-50" aria-label="Next month">
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-mist-500">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="relative mt-1 grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <span key={`e${i}`} />;
              const info = byDate.get(date);
              const available = Boolean(info?.slots.length);
              const active = day === date;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!available}
                  onClick={() => setDay(date)}
                  aria-pressed={active}
                  aria-label={`${date}${available ? `, ${info!.slots.length} times available` : ", unavailable"}`}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-all duration-200",
                    active && "bg-bone-50 font-medium text-ink-950",
                    !active && available && "text-bone-50 hover:bg-white/10",
                    !available && "text-mist-600 line-through decoration-white/10"
                  )}
                >
                  {Number(date.slice(8))}
                  {available && !active && <span className="absolute bottom-1.5 size-1 rounded-full bg-gold-300" />}
                </button>
              );
            })}
            {loading && (
              <div className="absolute inset-0 grid place-items-center rounded-xl bg-ink-900/60 backdrop-blur-[2px]">
                <Loader2 className="size-5 animate-spin text-gold-300" />
              </div>
            )}
          </div>
          {failed && <p className="mt-3 text-sm text-red-300">Couldn&rsquo;t load availability. Check your connection and try again.</p>}
        </div>

        <div>
          {selectedDay?.slots.length ? (
            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">
                  {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${selectedDay.date}T00:00:00Z`))}
                </p>
                {selectedDay.sunset && (
                  <p className="flex items-center gap-1.5 text-[12px] text-mist-400">
                    <Sunset className="size-3.5 text-gold-300" /> Sunset {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date(selectedDay.sunset))}
                  </p>
                )}
              </div>
              {groups.map((g) => (
                <div key={g.key}>
                  <p className="mb-2 flex items-center gap-2 text-[12px] tracking-[0.12em] text-mist-500 uppercase">
                    <g.icon className="size-3.5" /> {g.label}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {g.slots.map((s) => {
                      const active = slot?.start === s.start;
                      const preferred = inWindow(s);
                      return (
                        <button
                          key={s.start}
                          type="button"
                          onClick={() => onSelect({ start: s.start, end: s.end, label: s.label, date: selectedDay.date, kind: s.kind })}
                          aria-pressed={active}
                          className={cn(
                            "relative h-12 rounded-xl border text-sm tabular-nums transition-all duration-200",
                            active ? "border-gold-300 bg-gold-300 font-medium text-ink-950" : preferred ? "border-gold-300/40 text-bone-50 hover:bg-gold-300/10" : "border-white/10 text-bone-100 hover:border-white/30"
                          )}
                        >
                          {s.label}
                          {preferred && !active && <span className="absolute -top-1.5 right-1.5 rounded-full bg-gold-300 px-1.5 text-[9px] font-medium text-ink-950">Preferred</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid h-full min-h-48 place-items-center rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-mist-400">
              {loading ? "Checking the calendar…" : noAvailability ? "No openings this month — try next month or request a date below." : "Select a highlighted date to see times."}
            </div>
          )}
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm text-mist-300 hover:border-white/20">
        <input
          type="checkbox"
          checked={requestWithoutSlot}
          onChange={(e) => {
            onRequestWithoutSlot(e.target.checked);
            if (e.target.checked) onSelect(null);
          }}
          className="mt-0.5 size-4 accent-[#e6c998]"
        />
        <span>
          <span className="text-bone-100">I&rsquo;m flexible — contact me to schedule</span>
          <span className="block text-[13px] text-mist-500">We&rsquo;ll reach out within one business day to lock in a time{preferredDate ? " near your desired date" : ""}.</span>
        </span>
      </label>
    </div>
  );
}
