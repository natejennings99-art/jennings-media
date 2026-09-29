"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { LeadBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { LEAD_STATUS_META } from "@/lib/status";
import { cn, formatDateTime } from "@/lib/utils";
import { updateLead } from "@/app/admin/actions";
import type { ContactLead } from "@/lib/types";

export function LeadsBoard({ leads, focus, timezone }: { leads: ContactLead[]; focus: string | null; timezone: string }) {
  const [active, setActive] = useState<string | null>(focus ?? leads[0]?.id ?? null);
  const [filter, setFilter] = useState<string>("open");
  const lead = leads.find((l) => l.id === active) ?? null;
  const [status, setStatus] = useState(lead?.status ?? "new");
  const [notes, setNotes] = useState(lead?.admin_notes ?? "");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const shown = leads.filter((l) => (filter === "open" ? ["new", "contacted", "qualified"].includes(l.status) : filter === "all" ? true : l.status === filter));

  const select = (l: ContactLead) => {
    setActive(l.id);
    setStatus(l.status);
    setNotes(l.admin_notes ?? "");
  };

  if (!leads.length) return <EmptyState title="No inquiries yet" />;
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3 h-10 text-sm">
          <option value="open">Open</option>
          <option value="all">All</option>
          {Object.entries(LEAD_STATUS_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
        <div className="surface max-h-[70vh] divide-y divide-white/[0.05] overflow-y-auto rounded-2xl">
          {shown.map((l) => (
            <button key={l.id} type="button" onClick={() => select(l)} className={cn("block w-full px-4 py-3 text-left transition", active === l.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{l.name}</span>
                <LeadBadge status={l.status} />
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-mist-400">{l.message}</p>
              <p className="mt-1 text-[11px] text-mist-600">{l.reason.replace("_", " ")} · {formatDateTime(l.created_at, timezone)}</p>
            </button>
          ))}
        </div>
      </div>
      {lead && (
        <div className="surface rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.03em]">{lead.name}</h2>
              <p className="text-mist-400">{lead.company ?? ""}</p>
            </div>
            <div className="flex gap-2">
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your Jennings Media inquiry")}`} className="inline-flex h-9 items-center gap-2 rounded-full bg-bone-50 px-4 text-[13px] font-medium text-ink-950"><Mail className="size-4" /> Reply</a>
              {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px]"><Phone className="size-4" /> Call</a>}
            </div>
          </div>
          <p className="mt-2 text-sm text-mist-400">{lead.email} {lead.phone && `· ${lead.phone}`}</p>
          <p className="mt-6 whitespace-pre-wrap rounded-xl bg-white/[0.03] p-4 text-[15px] leading-relaxed">{lead.message}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Select value={status} onChange={(e) => setStatus(e.target.value as ContactLead["status"])} className="h-10 text-sm">
              {Object.entries(LEAD_STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes" />
          </div>
          <Button
            className="mt-4"
            size="sm"
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await updateLead(lead.id, status, notes);
                toast(res.ok ? { tone: "success", title: "Lead updated" } : { tone: "error", title: res.error });
                router.refresh();
              })
            }
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
