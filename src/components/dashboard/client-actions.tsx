"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Heart, MessageSquare, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { cancelMyBooking, requestChange, toggleFavorite } from "@/app/dashboard/actions";
import type { ActionResult } from "@/lib/types";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />} {done ? "Copied" : label}
    </Button>
  );
}

export function FavoriteToggle({ serviceId, active }: { serviceId: string; active: boolean }) {
  const [on, setOn] = useState(active);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOn(!on);
          const res = await toggleFavorite(serviceId);
          if (!res.ok) {
            setOn(on);
            toast({ tone: "error", title: res.error });
          }
        })
      }
      aria-pressed={on}
      aria-label={on ? "Remove from favorites" : "Add to favorites"}
      className={cn("grid size-10 place-items-center rounded-full border transition", on ? "border-rose-400/40 bg-rose-400/15 text-rose-300" : "border-white/10 text-mist-400 hover:text-bone-50")}
    >
      <Heart className={cn("size-4.5", on && "fill-current")} />
    </button>
  );
}

export function BookingSelfService({ bookingId, canCancel }: { bookingId: string; canCancel: boolean }) {
  const [open, setOpen] = useState<"change" | "cancel" | null>(null);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<ActionResult>, success: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast({ tone: "error", title: res.error });
      toast({ tone: "success", title: success });
      setOpen(null);
      setText("");
      router.refresh();
    });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen("change")}>
          <MessageSquare className="size-4" /> Request a change
        </Button>
        {canCancel && (
          <Button variant="ghost" size="sm" onClick={() => setOpen("cancel")} className="text-red-300 hover:text-red-200">
            <XCircle className="size-4" /> Cancel booking
          </Button>
        )}
      </div>
      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open === "cancel" ? "Cancel this booking?" : "Request a change"}
        description={open === "cancel" ? "Your time slot will be released. Any payment will be refunded per our policy." : "Reschedule, add a service, update access details — tell us what you need."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button
              variant={open === "cancel" ? "danger" : "primary"}
              loading={pending}
              onClick={() => (open === "cancel" ? run(() => cancelMyBooking(bookingId, text), "Booking cancelled") : run(() => requestChange(bookingId, text), "Request sent — we'll reply shortly"))}
            >
              {open === "cancel" ? "Cancel booking" : "Send request"}
            </Button>
          </>
        }
      >
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={open === "cancel" ? "Reason (optional)" : "e.g. Could we move this to Friday morning?"} rows={4} />
      </Dialog>
    </>
  );
}

export function useFormResult(action: (state: unknown, form: FormData) => Promise<ActionResult>, success: string) {
  const toast = useToast();
  return useActionState(async (state: unknown, form: FormData) => {
    const res = await action(state, form);
    toast(res.ok ? { tone: "success", title: success } : { tone: "error", title: res.error });
    return res;
  }, null);
}
