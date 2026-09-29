/**
 * Timezone helpers built on Intl (no dependencies). The business timezone comes
 * from business settings, so the app works in any market.
 */

const partsCache = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = partsCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    partsCache.set(timeZone, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
}

export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const map: Record<string, string> = {};
  for (const p of formatter(timeZone).formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
    weekday: WEEKDAYS[map.weekday] ?? 0,
  };
}

/** Offset (minutes) of `timeZone` from UTC at the given instant. */
export function tzOffsetMinutes(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** Convert a wall-clock date + time in `timeZone` to a UTC Date. */
export function zonedTimeToUtc(ymd: string, hm: string, timeZone: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  const [hh, mm] = hm.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = tzOffsetMinutes(new Date(guess), timeZone);
  let ts = guess - first * 60000;
  const second = tzOffsetMinutes(new Date(ts), timeZone);
  if (second !== first) ts = guess - second * 60000;
  return new Date(ts);
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function ymdOf(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function hmOf(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function todayYmd(timeZone: string, now = new Date()) {
  return ymdOf(now, timeZone);
}

export function addDaysYmd(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function weekdayOfYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function compareYmd(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** [start, end) of a local calendar day, as UTC instants. */
export function dayRangeUtc(ymd: string, timeZone: string) {
  return {
    start: zonedTimeToUtc(ymd, "00:00", timeZone),
    end: zonedTimeToUtc(addDaysYmd(ymd, 1), "00:00", timeZone),
  };
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}
