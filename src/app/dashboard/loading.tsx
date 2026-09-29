import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
