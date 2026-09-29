/**
 * Availability engine — turns business settings + existing appointments into
 * bookable time slots. Pure and deterministic (pass `now`), so it runs in tests,
 * on the server for the booking API, and again inside booking submission.
 */
import type { Appointment, Photographer, ScheduleBlock, SchedulingSettings } from "@/lib/types";
import { sunsetUtc } from "./sun";
import { addDaysYmd, compareYmd, dayRangeUtc, todayYmd, weekdayOfYmd, zonedTimeToUtc } from "./tz";

export interface SlotRules {
  daylight_only: boolean;
  twilight: boolean;
  min_notice_hours: number;
  skills: string[];
}

export interface AvailabilityContext {
  settings: SchedulingSettings;
  timeZone: string;
  durationMinutes: number;
  rules: SlotRules;
  appointments: Pick<Appointment, "starts_at" | "ends_at" | "status" | "hold_expires_at" | "buffer_before_minutes" | "buffer_after_minutes" | "photographer_id">[];
  blocks: Pick<ScheduleBlock, "starts_at" | "ends_at" | "photographer_id">[];
  photographers: Pick<Photographer, "id" | "skills" | "is_active" | "max_shoots_per_day">[];
  /** Property (or business) coordinates for sunset calculations. */
  latitude: number | null;
  longitude: number | null;
  now?: Date;
  /** Admin overrides skip notice/advance limits. */
  ignoreLimits?: boolean;
}

export interface Slot {
  start: string;
  end: string;
  /** Local wall-clock label, e.g. "9:30 AM". */
  label: string;
  kind: "standard" | "twilight";
  remaining: number;
}

export interface DayAvailability {
  date: string;
  slots: Slot[];
  closedReason: "past" | "closed" | "blocked" | "full" | "too_soon" | "too_far" | null;
  sunset: string | null;
}

const MINUTE = 60000;
const TWILIGHT_AFTER_SUNSET_MIN = 20;
const DAYLIGHT_MARGIN_MIN = 10;

function isActive(a: AvailabilityContext["appointments"][number], now: Date) {
  if (a.status === "scheduled") return true;
  if (a.status === "held") return Boolean(a.hold_expires_at && new Date(a.hold_expires_at) > now);
  return false;
}

/** How many shoots can run at the same time (qualified crew, minimum 1). */
export function crewCapacity(photographers: AvailabilityContext["photographers"], skills: string[]) {
  const active = photographers.filter((p) => p.is_active);
  if (active.length === 0) return 1;
  const qualified = active.filter((p) => skills.every((s) => p.skills.includes(s)));
  return Math.max(1, qualified.length || active.length);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

function labelFor(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

export function getDayAvailability(date: string, ctx: AvailabilityContext): DayAvailability {
  const now = ctx.now ?? new Date();
  const tz = ctx.timeZone;
  const s = ctx.settings;
  const duration = Math.max(15, ctx.durationMinutes || s.default_duration_minutes || 60);
  const result = (closedReason: DayAvailability["closedReason"], slots: Slot[] = [], sunset: Date | null = null): DayAvailability => ({
    date,
    slots,
    closedReason: slots.length ? null : closedReason,
    sunset: sunset ? sunset.toISOString() : null,
  });

  const today = todayYmd(tz, now);
  if (compareYmd(date, today) < 0) return result("past");
  if (!ctx.ignoreLimits && compareYmd(date, addDaysYmd(today, s.max_advance_days)) > 0) return result("too_far");

  const sunset =
    ctx.latitude !== null && ctx.longitude !== null ? sunsetUtc(date, ctx.latitude, ctx.longitude) : null;
  const intervals = s.working_hours[String(weekdayOfYmd(date))] ?? [];

  // Candidate start times
  const candidates: { start: Date; kind: Slot["kind"] }[] = [];
  if (ctx.rules.twilight) {
    if (!sunset) return result("closed");
    // Twilight sessions run past normal hours, but only on days the business operates.
    if (intervals.length === 0) return result("closed", [], sunset);
    const end = new Date(sunset.getTime() + TWILIGHT_AFTER_SUNSET_MIN * MINUTE);
    candidates.push({ start: new Date(end.getTime() - duration * MINUTE), kind: "twilight" });
  } else {
    if (intervals.length === 0) return result("closed", [], sunset);
    const step = Math.max(15, s.slot_interval_minutes || 30);
    for (const interval of intervals) {
      const open = zonedTimeToUtc(date, interval.start, tz).getTime();
      const close = zonedTimeToUtc(date, interval.end, tz).getTime();
      for (let t = open; t + duration * MINUTE <= close; t += step * MINUTE) {
        candidates.push({ start: new Date(t), kind: "standard" });
      }
    }
  }
  if (candidates.length === 0) return result("closed", [], sunset);

  const { start: dayStart, end: dayEnd } = dayRangeUtc(date, tz);
  const dayAppointments = ctx.appointments.filter((a) => {
    const t = new Date(a.starts_at).getTime();
    return isActive(a, now) && t >= dayStart.getTime() && t < dayEnd.getTime();
  });
  if (dayAppointments.length >= s.max_shoots_per_day) return result("full", [], sunset);

  const capacity = crewCapacity(ctx.photographers, ctx.rules.skills);
  const noticeHours = ctx.ignoreLimits ? 0 : Math.max(s.min_notice_hours, ctx.rules.min_notice_hours);
  const earliest = now.getTime() + noticeHours * 60 * MINUTE;
  const businessBlocks = ctx.blocks.filter((b) => !b.photographer_id);
  const crewBlocks = ctx.blocks.filter((b) => b.photographer_id);
  const activeAppointments = ctx.appointments.filter((a) => isActive(a, now));

  let tooSoon = 0;
  let blocked = 0;
  const slots: Slot[] = [];
  for (const c of candidates) {
    const start = c.start.getTime();
    const end = start + duration * MINUTE;
    if (start < earliest) {
      tooSoon++;
      continue;
    }
    if (ctx.rules.daylight_only && !ctx.rules.twilight && sunset && end > sunset.getTime() - DAYLIGHT_MARGIN_MIN * MINUTE) {
      continue;
    }
    if (businessBlocks.some((b) => overlaps(start, end, new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()))) {
      blocked++;
      continue;
    }
    const unavailableCrew = crewBlocks.filter((b) =>
      overlaps(start, end, new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime())
    ).length;
    const busy = activeAppointments.filter((a) =>
      overlaps(
        start,
        end,
        new Date(a.starts_at).getTime() - a.buffer_before_minutes * MINUTE,
        new Date(a.ends_at).getTime() + a.buffer_after_minutes * MINUTE
      )
    ).length;
    const remaining = capacity - unavailableCrew - busy;
    if (remaining <= 0) continue;
    slots.push({
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      label: labelFor(new Date(start), tz),
      kind: c.kind,
      remaining,
    });
  }

  if (slots.length) return result(null, slots, sunset);
  if (tooSoon === candidates.length) return result("too_soon", [], sunset);
  if (blocked === candidates.length) return result("blocked", [], sunset);
  return result("full", [], sunset);
}

export function getAvailabilityRange(from: string, days: number, ctx: AvailabilityContext): DayAvailability[] {
  const out: DayAvailability[] = [];
  for (let i = 0; i < days; i++) out.push(getDayAvailability(addDaysYmd(from, i), ctx));
  return out;
}

/** Whether an exact start time is still bookable (used at submission). */
export function isSlotAvailable(startIso: string, ctx: AvailabilityContext) {
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: ctx.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(start);
  const availability = getDayAvailability(day, ctx);
  return availability.slots.find((s) => s.start === start.toISOString()) ?? null;
}
