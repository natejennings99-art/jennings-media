"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, CreditCard, Link2, Plus, RotateCcw, Send, StickyNote, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea, Checkbox } from "@/components/ui/field";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/types";
import { BOOKING_STATUS_META, nextStatus } from "@/lib/status";
import { formatMoney } from "@/lib/utils";
import {
  addBookingNote, addLineItem, cancelBooking, createPaymentLink, recordPayment, refundPayment, removeLineItem,
  saveAppointment, setAdjustments, setBookingStatus,
} from "@/app/admin/actions";

function useRun() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: true } | { ok: false; error: string }>, success: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast({ tone: "error", title: res.error });
      toast({ tone: "success", title: success });
      after?.();
      router.refresh();
    });
  return { pending, run };
}

export function StatusControl({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const { pending, run } = useRun();
  const [value, setValue] = useState<BookingStatus>(status);
  const [notify, setNotify] = useState(true);
  const next = nextStatus(status);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {next && status !== "cancelled" && (
          <Button size="sm" loading={pending} onClick={() => run(() => setBookingStatus(bookingId, next, notify), `Marked ${BOOKING_STATUS_META[next].label}`)}>
            Mark {BOOKING_STATUS_META[next].label}
          </Button>
        )}
        <Select value={value} onChange={(e) => setValue(e.target.value as BookingStatus)} className="h-9 w-48 text-sm">
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_META[s].label}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" disabled={value === status || pending} onClick={() => run(() => setBookingStatus(bookingId, value, notify), "Status updated")}>
          Set status
        </Button>
      </div>
      <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} label="Email the client about status changes" />
    </div>
  );
}

export function ScheduleControl({
  bookingId,
  appointment,
  photographers,
  timezone,
  defaultDuration,
}: {
  bookingId: string;
  appointment: { id: string; starts_at: string; ends_at: string; photographer_id: string | null } | null;
  photographers: { id: string; name: string }[];
  timezone: string;
  defaultDuration: number;
}) {
  const { pending, run } = useRun();
  const toLocal = (iso: string) => {
    const p = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso));
    const g = (t: string) => p.find((x) => x.type === t)?.value ?? "00";
    return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
  };
  const [when, setWhen] = useState(appointment ? toLocal(appointment.starts_at) : "");
  const [duration, setDuration] = useState(appointment ? Math.round((new Date(appointment.ends_at).getTime() - new Date(appointment.starts_at).getTime()) / 60000) : defaultDuration);
  const [photographer, setPhotographer] = useState(appointment?.photographer_id ?? "");
  const [notify, setNotify] = useState(true);

  const toIso = (local: string) => {
    // Interpret the wall-clock time in the business timezone.
    const [d, t] = local.split("T");
    const guess = new Date(`${d}T${t}:00Z`);
    const offset = (() => {
      const p = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(guess);
      const g = (x: string) => Number(p.find((y) => y.type === x)?.value);
      return (Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute")) - guess.getTime()) / 60000;
    })();
    return new Date(guess.getTime() - offset * 60000).toISOString();
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={`Start (${timezone.replace("_", " ")})`} htmlFor="appt-start">
        <Input id="appt-start" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-10 text-sm" />
      </Field>
      <Field label="Duration (minutes)" htmlFor="appt-duration">
        <Input id="appt-duration" type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="h-10 text-sm" />
      </Field>
      <Field label="Photographer" htmlFor="appt-ph" className="sm:col-span-2">
        <Select id="appt-ph" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="h-10 text-sm">
          <option value="">Unassigned</option>
          {photographers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} label="Notify client" />
        <Button
          size="sm"
          loading={pending}
          disabled={!when}
          onClick={() =>
            run(
              () => saveAppointment({ bookingId, appointmentId: appointment?.id ?? null, startsAt: toIso(when), durationMinutes: duration, photographerId: photographer || null, notify }),
              appointment ? "Appointment updated" : "Appointment scheduled"
            )
          }
        >
          {appointment ? "Save changes" : "Schedule"}
        </Button>
      </div>
    </div>
  );
}

export function LineItemsControl({
  bookingId,
  items,
  catalog,
  discountCents,
  travelFeeCents,
  discountLabel,
}: {
  bookingId: string;
  items: { id: string; name: string; quantity: number; total_cents: number; included_in_package: boolean; description: string | null }[];
  catalog: { id: string; kind: "service" | "add_on"; name: string; priceCents: number }[];
  discountCents: number;
  travelFeeCents: number;
  discountLabel: string | null;
}) {
  const { pending, run } = useRun();
  const [adding, setAdding] = useState(false);
  const [ref, setRef] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(String(discountCents / 100));
  const [travel, setTravel] = useState(String(travelFeeCents / 100));
  const [label, setLabel] = useState(discountLabel ?? "");

  const pick = (value: string) => {
    setRef(value);
    const item = catalog.find((c) => `${c.kind}:${c.id}` === value);
    if (item) {
      setName(item.name);
      setPrice(String(item.priceCents / 100));
    }
  };

  return (
    <div>
      <ul className="divide-y divide-white/[0.06]">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className={i.included_in_package ? "pl-4 text-mist-400" : ""}>
              {i.name}
              {i.quantity > 1 && <span className="text-mist-500"> × {i.quantity}</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums text-mist-300">{i.included_in_package ? "Included" : formatMoney(i.total_cents, "usd", { exact: true })}</span>
              {!i.included_in_package && (
                <button type="button" className="grid size-7 place-items-center rounded-lg text-mist-500 hover:bg-white/10 hover:text-red-300" onClick={() => confirm(`Remove ${i.name}?`) && run(() => removeLineItem(i.id), "Item removed")} aria-label={`Remove ${i.name}`}>
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Add service or fee
        </Button>
      </div>
      <div className="mt-5 grid gap-3 border-t border-white/[0.07] pt-5 sm:grid-cols-3">
        <Field label="Discount ($)" htmlFor="adj-d">
          <Input id="adj-d" type="number" step="0.01" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="h-10 text-sm" />
        </Field>
        <Field label="Discount label" htmlFor="adj-l">
          <Input id="adj-l" value={label} onChange={(e) => setLabel(e.target.value)} className="h-10 text-sm" />
        </Field>
        <Field label="Travel fee ($)" htmlFor="adj-t">
          <Input id="adj-t" type="number" step="0.01" min={0} value={travel} onChange={(e) => setTravel(e.target.value)} className="h-10 text-sm" />
        </Field>
        <div className="sm:col-span-3">
          <Button variant="outline" size="sm" loading={pending} onClick={() => run(() => setAdjustments(bookingId, Math.round(Number(discount) * 100), Math.round(Number(travel) * 100), label), "Totals updated")}>
            Update totals
          </Button>
        </div>
      </div>
      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add to order"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button
              loading={pending}
              onClick={() => {
                const [kind, id] = ref.split(":");
                run(
                  () => addLineItem({ bookingId, kind: (kind === "service" || kind === "add_on" ? kind : "fee") as "service" | "add_on" | "fee", refId: id || null, name, quantity: qty, unitPriceCents: Math.round(Number(price) * 100) }),
                  "Added to order",
                  () => setAdding(false)
                );
              }}
            >
              Add
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="From catalog" htmlFor="li-ref">
            <Select id="li-ref" value={ref} onChange={(e) => pick(e.target.value)}>
              <option value="">Custom fee / item</option>
              {catalog.map((c) => (
                <option key={`${c.kind}:${c.id}`} value={`${c.kind}:${c.id}`}>
                  {c.name} ({c.kind === "service" ? "service" : "add-on"})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Name" htmlFor="li-name">
            <Input id="li-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Extra trip fee" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Unit price ($)" htmlFor="li-price">
              <Input id="li-price" type="number" step="0.01" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </Field>
            <Field label="Quantity" htmlFor="li-qty">
              <Input id="li-qty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </Field>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export function PaymentsControl({
  bookingId,
  dueCents,
  payments,
  stripeEnabled,
}: {
  bookingId: string;
  dueCents: number;
  payments: { id: string; amount_cents: number; refunded_cents: number; status: string; provider: string; method: string; kind: string; paid_at: string | null; receipt_url: string | null }[];
  stripeEnabled: boolean;
}) {
  const { pending, run } = useRun();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, dueCents) / 100));
  const [method, setMethod] = useState("check");
  const [note, setNote] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [linkPending, startLink] = useTransition();

  return (
    <div className="space-y-4">
      {payments.length === 0 && <p className="text-sm text-mist-500">No payments yet.</p>}
      <ul className="space-y-2">
        {payments.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.07] px-3 py-2.5 text-sm">
            <span>
              {formatMoney(p.amount_cents, "usd", { exact: true })} <span className="text-mist-500">· {p.provider === "stripe" ? "Card" : p.method} · {p.kind}</span>
              {p.refunded_cents > 0 && <span className="text-violet-300"> · refunded {formatMoney(p.refunded_cents, "usd", { exact: true })}</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[12px] text-mist-400">{p.status}</span>
              {p.receipt_url && <a href={p.receipt_url} target="_blank" rel="noreferrer" className="text-[12px] text-gold-200 hover:underline">Receipt</a>}
              {["succeeded", "partially_refunded"].includes(p.status) && p.refunded_cents < p.amount_cents && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-[12px] text-mist-400 hover:text-red-300"
                  onClick={() => {
                    const input = prompt("Refund amount in dollars (leave blank for full remaining):", "");
                    if (input === null) return;
                    const cents = input.trim() ? Math.round(Number(input) * 100) : null;
                    run(() => refundPayment(p.id, cents), "Refund issued");
                  }}
                >
                  <RotateCcw className="size-3" /> Refund
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <CreditCard className="size-4" /> Record payment
        </Button>
        {stripeEnabled && dueCents > 0 && (
          <Button
            variant="outline"
            size="sm"
            loading={linkPending}
            onClick={() =>
              startLink(async () => {
                const res = await createPaymentLink(bookingId, true);
                if (!res.ok) return toast({ tone: "error", title: res.error });
                setLink(res.data.url);
                toast({ tone: "success", title: "Payment link emailed to client" });
              })
            }
          >
            <Link2 className="size-4" /> Send payment link
          </Button>
        )}
      </div>
      {link && (
        <button type="button" onClick={() => navigator.clipboard.writeText(link)} className="flex w-full items-center gap-2 truncate rounded-xl border border-white/10 px-3 py-2 text-left text-[12px] text-mist-300">
          <Copy className="size-3.5 shrink-0" /> {link}
        </button>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Record a manual payment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={pending} onClick={() => run(() => recordPayment(bookingId, Math.round(Number(amount) * 100), method, note), "Payment recorded", () => setOpen(false))}>
              Record
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount ($)" htmlFor="pay-amt">
            <Input id="pay-amt" type="number" step="0.01" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Method" htmlFor="pay-method">
            <Select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)}>
              {["check", "cash", "ach", "zelle", "venmo", "other"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Note" htmlFor="pay-note" className="sm:col-span-2">
            <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Check #1042" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}

export function NotesControl({ bookingId }: { bookingId: string }) {
  const { pending, run } = useRun();
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Add an internal note or message the client…" />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" loading={pending} disabled={!text.trim()} onClick={() => run(() => addBookingNote(bookingId, text, false), "Note added", () => setText(""))}>
          <StickyNote className="size-4" /> Internal note
        </Button>
        <Button size="sm" loading={pending} disabled={!text.trim()} onClick={() => run(() => addBookingNote(bookingId, text, true), "Message sent to client", () => setText(""))}>
          <Send className="size-4" /> Message client
        </Button>
      </div>
    </div>
  );
}

export function CancelControl({ bookingId }: { bookingId: string }) {
  const { pending, run } = useRun();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <XCircle className="size-4" /> Cancel booking
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Cancel this booking?"
        description="Releases the appointment. Refund payments separately if needed."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Keep booking</Button>
            <Button variant="danger" loading={pending} onClick={() => run(() => cancelBooking(bookingId, reason, notify), "Booking cancelled", () => setOpen(false))}>
              Cancel booking
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (shared with the client)" rows={3} />
          <Checkbox checked={notify} onChange={(e) => setNotify(e.target.checked)} label="Email the client" />
        </div>
      </Dialog>
    </>
  );
}

