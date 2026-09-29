import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const moneyFormatters = new Map<string, Intl.NumberFormat>();
/** Format integer cents as currency. Whole-dollar amounts drop the decimals. */
export function formatMoney(cents: number, currency = "usd", opts: { exact?: boolean } = {}) {
  const whole = cents % 100 === 0 && !opts.exact;
  const key = `${currency}-${whole}`;
  let fmt = moneyFormatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    moneyFormatters.set(key, fmt);
  }
  return fmt.format(cents / 100);
}

export function formatDate(
  value: string | Date | null | undefined,
  timeZone?: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(date);
}

export function formatTime(value: string | Date | null | undefined, timeZone?: string) {
  return formatDate(value, timeZone, { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(value: string | Date | null | undefined, timeZone?: string) {
  return formatDate(value, timeZone, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Format a calendar date string (YYYY-MM-DD) without timezone drift. */
export function formatCalendarDate(ymd: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    ...(options ?? { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function fullAddress(p: {
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
}) {
  return `${p.address_line1}${p.address_line2 ? `, ${p.address_line2}` : ""}, ${p.city}, ${p.state} ${p.postal_code}`;
}

export function formatPhone(phone: string | null | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const d = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (d.length !== 10) return phone;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function absoluteUrl(path: string, base: string) {
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** True when `iso` is more than `hours` hours in the future. */
export function isMoreThanHoursAway(iso: string, hours: number) {
  return new Date(iso).getTime() - Date.now() > hours * 3600 * 1000;
}
