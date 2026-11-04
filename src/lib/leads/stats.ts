import { CREATOR_STATUSES, type CreatorStatus } from "@/lib/types";

/** Counts applicants per pipeline stage, always listing every stage (zeros included). */
export function countByStage(rows: { status: string }[]): Record<CreatorStatus, number> {
  const out = Object.fromEntries(CREATOR_STATUSES.map((s) => [s, 0])) as Record<CreatorStatus, number>;
  for (const r of rows) if (r.status in out) out[r.status as CreatorStatus] += 1;
  return out;
}

/** ISO timestamp for "now minus N days", the window /api/stats reports on. */
export function sinceDays(days: number, now = Date.now()) {
  return new Date(now - days * 86_400_000).toISOString();
}
