"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { emailInvoice, voidInvoice } from "@/app/admin/actions";

export function InvoiceActions({ invoiceId, bookingId, status, due }: { invoiceId: string; bookingId: string | null; status: string; due: number }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? { tone: "success", title: msg } : { tone: "error", title: res.error ?? "Failed" });
      router.refresh();
    });
  return (
    <>
      {bookingId && status === "open" && due > 0 && (
        <Button size="sm" variant="outline" loading={pending} onClick={() => run(() => emailInvoice(bookingId), "Invoice emailed")}>
          <Mail className="size-4" /> Email invoice
        </Button>
      )}
      {status !== "void" && status !== "paid" && (
        <Button size="sm" variant="danger" loading={pending} onClick={() => confirm("Void this invoice?") && run(() => voidInvoice(invoiceId), "Invoice voided")}>
          <Ban className="size-4" /> Void
        </Button>
      )}
    </>
  );
}
