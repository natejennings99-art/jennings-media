"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      <div>
        <h1 className="text-4xl font-medium tracking-[-0.04em]">Something went sideways.</h1>
        <p className="mt-3 text-mist-400">Please try again. If it keeps happening, contact us and mention code {error.digest ?? "—"}.</p>
        <Button className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
