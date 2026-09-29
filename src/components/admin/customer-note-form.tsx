"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { addCustomerNote } from "@/app/admin/actions";

export function CustomerNoteForm({ customerId }: { customerId: string }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="space-y-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Preferences, gate codes they reuse, billing notes…" />
      <Button
        size="sm"
        variant="outline"
        loading={pending}
        disabled={!text.trim()}
        onClick={() =>
          start(async () => {
            const res = await addCustomerNote(customerId, text);
            if (!res.ok) return toast({ tone: "error", title: res.error });
            setText("");
            router.refresh();
          })
        }
      >
        Add note
      </Button>
    </div>
  );
}
