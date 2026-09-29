import { formatMoney } from "@/lib/utils";

/** Minimal single-series bar chart (server-rendered SVG). */
export function RevenueChart({ data }: { data: { month: string; revenue_cents: number; bookings_count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue_cents));
  const W = 600;
  const H = 200;
  const gap = 18;
  const bar = (W - gap * (data.length - 1)) / data.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 40}`} className="w-full" role="img" aria-label="Revenue by month">
        {data.map((d, i) => {
          const h = Math.max(2, (d.revenue_cents / max) * H);
          const x = i * (bar + gap);
          const label = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${d.month}T00:00:00Z`));
          const last = i === data.length - 1;
          return (
            <g key={d.month}>
              <rect x={x} y={H - h} width={bar} height={h} rx={8} className={last ? "fill-accent-300" : "fill-white/15"} />
              <text x={x + bar / 2} y={H - h - 8} textAnchor="middle" className="fill-mist-300 text-[13px] tabular-nums">
                {d.revenue_cents ? formatMoney(d.revenue_cents) : ""}
              </text>
              <text x={x + bar / 2} y={H + 26} textAnchor="middle" className="fill-mist-500 text-[13px]">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {data.map((d) => `${d.month}: ${formatMoney(d.revenue_cents)} from ${d.bookings_count} bookings`).join("; ")}
      </figcaption>
    </figure>
  );
}
