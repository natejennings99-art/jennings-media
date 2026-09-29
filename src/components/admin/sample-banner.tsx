import { AlertTriangle } from "lucide-react";

export function SampleBanner({ count, kind }: { count: number; kind: string }) {
  if (!count) return null;
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <p>
        {count} sample {kind} {count === 1 ? "is" : "are"} published. Samples are hidden in production unless SHOW_SAMPLE_CONTENT=true — replace them with your own work before launch.
      </p>
    </div>
  );
}
