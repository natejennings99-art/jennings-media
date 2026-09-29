import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

const buckets = new Map<string, number[]>();

/**
 * Best-effort in-memory sliding-window limiter (per server instance). Pair with
 * Vercel WAF / Upstash for strict global limits at scale.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/** One-way hash so raw IPs are never stored. */
export function hashIp(ip: string) {
  return createHash("sha256").update(`${ip}:${process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "jm"}`).digest("hex").slice(0, 32);
}
