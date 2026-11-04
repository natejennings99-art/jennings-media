"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { CREATOR_STATUS_META } from "@/lib/status";
import { DISCIPLINE_LABELS } from "@/lib/content/creators";
import { cn, formatDateTime, formatPhone } from "@/lib/utils";
import { updateCreatorApplicant } from "@/app/admin/actions";
import { CREATOR_STATUSES, type CreatorApplicant, type CreatorStatus } from "@/lib/types";

const OPEN: CreatorStatus[] = ["applied", "contacted", "trial_shoot"];

/** Admin → Creators: /join applicants with a status dropdown (applied → contacted → trial shoot → active / no). */
export function CreatorsBoard({ applicants, focus, timezone }: { applicants: CreatorApplicant[]; focus: string | null; timezone: string }) {
  const [active, setActive] = useState<string | null>(focus ?? applicants[0]?.id ?? null);
  const [filter, setFilter] = useState<string>("open");
  const applicant = applicants.find((a) => a.id === active) ?? null;
  const [status, setStatus] = useState<CreatorStatus>(applicant?.status ?? "applied");
  const [notes, setNotes] = useState(applicant?.admin_notes ?? "");
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const shown = applicants.filter((a) => (filter === "open" ? OPEN.includes(a.status) : filter === "all" ? true : a.status === filter));

  const select = (a: CreatorApplicant) => {
    setActive(a.id);
    setStatus(a.status);
    setNotes(a.admin_notes ?? "");
  };

  if (!applicants.length) return <EmptyState title="No applicants yet" description="Photographers and videographers who apply at /join show up here." />;
  return (
    <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3 h-10 text-sm">
          <option value="open">Open</option>
          <option value="all">All</option>
          {CREATOR_STATUSES.map((k) => (
            <option key={k} value={k}>
              {CREATOR_STATUS_META[k].label}
            </option>
          ))}
        </Select>
        <div className="surface max-h-[70vh] divide-y divide-white/[0.05] overflow-y-auto rounded-2xl">
          {shown.map((a) => (
            <button key={a.id} type="button" onClick={() => select(a)} className={cn("block w-full px-4 py-3 text-left transition", active === a.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{a.name}</span>
                <Badge tone={CREATOR_STATUS_META[a.status]?.tone ?? "neutral"} dot>
                  {CREATOR_STATUS_META[a.status]?.label ?? a.status}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-mist-400">
                {DISCIPLINE_LABELS[a.discipline] ?? a.discipline}
                {a.day_rate != null ? ` · $${a.day_rate.toLocaleString("en-US")}/day` : ""}
              </p>
              <p className="mt-1 text-[11px] text-mist-600">{formatDateTime(a.created_at, timezone)}</p>
            </button>
          ))}
          {!shown.length && <p className="px-4 py-6 text-sm text-mist-500">Nothing in this view.</p>}
        </div>
      </div>
      {applicant && (
        <div className="surface rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.03em]">{applicant.name}</h2>
              <p className="text-mist-400">
                {DISCIPLINE_LABELS[applicant.discipline] ?? applicant.discipline}
                {applicant.day_rate != null ? ` · $${applicant.day_rate.toLocaleString("en-US")}/day` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={applicant.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-bone-50 px-4 text-[13px] font-medium text-ink-950">
                <ExternalLink className="size-4" /> Portfolio
              </a>
              <a href={`mailto:${applicant.email}?subject=${encodeURIComponent("Your Jennings Media application")}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px]">
                <Mail className="size-4" /> Email
              </a>
              <a href={`tel:${applicant.phone}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px]">
                <Phone className="size-4" /> Call
              </a>
            </div>
          </div>
          <p className="mt-2 text-sm text-mist-400">
            {applicant.email} · {formatPhone(applicant.phone)}
          </p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/[0.03] p-3 sm:col-span-3">
              <dt className="text-[11px] tracking-wide text-mist-500 uppercase">Portfolio</dt>
              <dd className="mt-1 truncate text-sm">
                <a href={applicant.portfolio_url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-accent-300">
                  {applicant.portfolio_url}
                </a>
              </dd>
            </div>
            {applicant.availability && (
              <div className="rounded-xl bg-white/[0.03] p-3">
                <dt className="text-[11px] tracking-wide text-mist-500 uppercase">Availability</dt>
                <dd className="mt-1 text-sm">{applicant.availability}</dd>
              </div>
            )}
            {applicant.gear && (
              <div className="rounded-xl bg-white/[0.03] p-3 sm:col-span-2">
                <dt className="text-[11px] tracking-wide text-mist-500 uppercase">Gear</dt>
                <dd className="mt-1 text-sm whitespace-pre-wrap">{applicant.gear}</dd>
              </div>
            )}
          </dl>
          {applicant.notes && <p className="mt-6 whitespace-pre-wrap rounded-xl bg-white/[0.03] p-4 text-[15px] leading-relaxed">{applicant.notes}</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <Select value={status} onChange={(e) => setStatus(e.target.value as CreatorStatus)} className="h-10 text-sm">
              {CREATOR_STATUSES.map((k) => (
                <option key={k} value={k}>
                  {CREATOR_STATUS_META[k].label}
                </option>
              ))}
            </Select>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Internal notes (call outcome, trial shoot date, rate agreed…)" />
          </div>
          <Button
            className="mt-4"
            size="sm"
            loading={pending}
            onClick={() =>
              start(async () => {
                const res = await updateCreatorApplicant(applicant.id, status, notes);
                toast(res.ok ? { tone: "success", title: "Applicant updated" } : { tone: "error", title: res.error });
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
