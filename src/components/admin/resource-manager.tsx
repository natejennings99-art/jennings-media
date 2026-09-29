"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import { deleteResource, saveResource } from "@/app/admin/resources";
import { createPublicUpload } from "@/app/admin/actions";

export type FieldType = "text" | "textarea" | "number" | "money" | "select" | "boolean" | "list" | "tiers" | "multiselect" | "json" | "image" | "datetime" | "color" | "slug";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  hint?: string;
  required?: boolean;
  wide?: boolean;
  placeholder?: string;
  /** Show only when another field has one of these values. */
  when?: { field: string; in: string[] };
}

export interface ColumnDef {
  key: string;
  label: string;
  format?: "text" | "money" | "boolean" | "date" | "image" | "badge" | "list" | "count" | "percentOrMoney";
  className?: string;
}

type Row = Record<string, unknown> & { id: string };
type Tier = { max_sqft: string; price: string };

function toFormValue(field: FieldDef, value: unknown): unknown {
  if (value === null || value === undefined) {
    if (field.type === "boolean") return false;
    if (field.type === "tiers") return [];
    if (field.type === "multiselect") return [];
    return "";
  }
  switch (field.type) {
    case "money":
      return String(Number(value) / 100);
    case "list":
      return Array.isArray(value) ? value.join("\n") : String(value);
    case "json":
      return JSON.stringify(value, null, 2);
    case "tiers":
      return (value as { max_sqft: number | null; price_cents: number }[]).map((t) => ({ max_sqft: t.max_sqft === null ? "" : String(t.max_sqft), price: String(t.price_cents / 100) }));
    case "datetime": {
      const d = new Date(String(value));
      if (Number.isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    default:
      return value;
  }
}

function toPayload(fields: FieldDef[], values: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === "datetime") out[f.name] = v ? new Date(String(v)).toISOString() : null;
    else if (f.type === "tiers") out[f.name] = (v as Tier[]).filter((t) => t.price !== "");
    else out[f.name] = v;
  }
  return out;
}

function Cell({ row, col }: { row: Row; col: ColumnDef }) {
  const v = row[col.key];
  switch (col.format) {
    case "money":
      return <span className="tabular-nums">{typeof v === "number" ? formatMoney(v, "usd", { exact: v % 100 !== 0 }) : "—"}</span>;
    case "percentOrMoney":
      return <span>{row.discount_type === "percent" ? `${v}%` : formatMoney(Number(v))}</span>;
    case "boolean":
      return v ? <Badge tone="green">Yes</Badge> : <Badge>No</Badge>;
    case "date":
      return <span className="text-mist-400">{v ? formatDate(String(v)) : "—"}</span>;
    case "image":
      return v ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={String(v)} alt="" className="size-10 rounded-lg object-cover" />
      ) : (
        <span className="text-mist-600">—</span>
      );
    case "badge":
      return <Badge tone="accent">{String(v ?? "—").replace(/_/g, " ")}</Badge>;
    case "list":
      return <span className="text-mist-400">{Array.isArray(v) ? v.slice(0, 4).join(", ") : "—"}</span>;
    case "count":
      return <span className="tabular-nums">{Array.isArray(v) ? v.length : Number(v ?? 0)}</span>;
    default:
      return <span>{v === null || v === undefined || v === "" ? "—" : String(v)}</span>;
  }
}

export function ResourceManager({
  resource,
  title,
  rows,
  columns,
  fields,
  defaults,
  searchKeys = ["name"],
  uploadFolder,
  emptyTitle,
}: {
  resource: string;
  title: string;
  rows: Row[];
  columns: ColumnDef[];
  fields: FieldDef[];
  defaults: Record<string, unknown>;
  searchKeys?: string[];
  uploadFolder?: string;
  emptyTitle?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<Row | null | "new">(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const open = (row: Row | "new") => {
    const source = row === "new" ? defaults : row;
    setValues(Object.fromEntries(fields.map((f) => [f.name, toFormValue(f, source[f.name] ?? defaults[f.name])])));
    setErrors({});
    setEditing(row);
  };
  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const save = () =>
    start(async () => {
      const id = editing && editing !== "new" ? editing.id : null;
      const res = await saveResource(resource, id, toPayload(fields, values));
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast({ tone: "error", title: res.error });
        return;
      }
      toast({ tone: "success", title: `${title} saved` });
      setEditing(null);
      router.refresh();
    });

  const remove = (row: Row) => {
    if (!confirm("Delete this item? This can't be undone.")) return;
    start(async () => {
      const res = await deleteResource(resource, row.id);
      if (!res.ok) return toast({ tone: "error", title: res.error });
      toast({ tone: "success", title: "Deleted" });
      setEditing(null);
      router.refresh();
    });
  };

  async function upload(field: string, file: File) {
    setUploading(field);
    try {
      const res = await createPublicUpload(uploadFolder ?? resource, file.name);
      if (!res.ok) throw new Error(res.error);
      const { error } = await createClient().storage.from("public-media").uploadToSignedUrl(res.data.path, res.data.token, file, { contentType: file.type });
      if (error) throw error;
      if (field.endsWith("[]")) {
        const key = field.slice(0, -2);
        set(key, `${String(values[key] ?? "").trim()}\n${res.data.publicUrl}`.trim());
      } else set(field, res.data.publicUrl);
      toast({ tone: "success", title: "Uploaded" });
    } catch (error) {
      toast({ tone: "error", title: "Upload failed", description: error instanceof Error ? error.message : undefined });
    } finally {
      setUploading(null);
    }
  }

  const visibleFields = fields.filter((f) => !f.when || f.when.in.includes(String(values[f.when.field] ?? "")));

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mist-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="h-10 pl-10 text-sm" />
        </div>
        <Button size="sm" onClick={() => open("new")}>
          <Plus className="size-4" /> New {title.toLowerCase()}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle ?? `No ${title.toLowerCase()} yet`} action={<Button size="sm" onClick={() => open("new")}>Create one</Button>} />
      ) : (
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-white/[0.07] text-left text-[11.5px] tracking-wide text-mist-500 uppercase">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={cn("px-4 py-3 font-normal", c.className)}>
                    {c.label}
                  </th>
                ))}
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filtered.map((row) => (
                <tr key={row.id} className="cursor-pointer transition hover:bg-white/[0.025]" onClick={() => open(row)}>
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3", c.className)}>
                      <Cell row={row} col={c} />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Pencil className="ml-auto size-4 text-mist-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        variant="sheet"
        title={editing === "new" ? `New ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`}
        footer={
          <div className="flex w-full items-center justify-between">
            {editing && editing !== "new" ? (
              <Button variant="ghost" size="sm" className="text-red-300" onClick={() => remove(editing)} disabled={pending}>
                <Trash2 className="size-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} loading={pending}>
                Save
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {visibleFields.map((f) => {
            const v = values[f.name];
            const error = errors[f.name];
            const id = `rf-${f.name}`;
            const wide = f.wide || ["textarea", "list", "tiers", "multiselect", "json", "image"].includes(f.type);
            return (
              <div key={f.name} className={wide ? "sm:col-span-2" : undefined}>
                {f.type === "boolean" ? (
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-3 text-sm">
                    <span>
                      {f.label}
                      {f.hint && <span className="block text-[12px] text-mist-500">{f.hint}</span>}
                    </span>
                    <Switch checked={Boolean(v)} onChange={(x) => set(f.name, x)} label={f.label} />
                  </label>
                ) : (
                  <Field label={f.label} htmlFor={id} hint={f.hint} error={error}>
                    {f.type === "textarea" || f.type === "list" || f.type === "json" ? (
                      <Textarea id={id} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} rows={f.type === "json" ? 6 : 4} placeholder={f.placeholder ?? (f.type === "list" ? "One per line" : undefined)} className={f.type === "json" ? "font-mono text-[13px]" : undefined} />
                    ) : f.type === "select" ? (
                      <Select id={id} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    ) : f.type === "multiselect" ? (
                      <div className="flex flex-wrap gap-1.5">
                        {f.options?.map((o) => {
                          const selected = (v as string[]).includes(o.value);
                          return (
                            <button key={o.value} type="button" onClick={() => set(f.name, selected ? (v as string[]).filter((x) => x !== o.value) : [...(v as string[]), o.value])} className={cn("rounded-full border px-3 py-1.5 text-[12.5px] transition", selected ? "border-accent-300 bg-accent-300/15 text-accent-100" : "border-white/10 text-mist-400 hover:text-bone-50")}>
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : f.type === "tiers" ? (
                      <div className="space-y-2">
                        {(v as Tier[]).map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input value={t.max_sqft} placeholder="Max sq ft (blank = any)" inputMode="numeric" onChange={(e) => set(f.name, (v as Tier[]).map((x, j) => (j === i ? { ...x, max_sqft: e.target.value.replace(/\D/g, "") } : x)))} className="h-10 text-sm" />
                            <Input value={t.price} placeholder="Price $" inputMode="decimal" onChange={(e) => set(f.name, (v as Tier[]).map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} className="h-10 w-32 text-sm" />
                            <button type="button" onClick={() => set(f.name, (v as Tier[]).filter((_, j) => j !== i))} className="grid size-9 shrink-0 place-items-center rounded-lg text-mist-500 hover:bg-white/10" aria-label="Remove tier">
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => set(f.name, [...(v as Tier[]), { max_sqft: "", price: "" }])}>
                          <Plus className="size-3.5" /> Add size tier
                        </Button>
                      </div>
                    ) : f.type === "image" ? (
                      <div className="flex items-center gap-3">
                        {v ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={String(v)} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
                        ) : null}
                        <Input id={id} value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)} placeholder="https://…" className="h-10 text-sm" />
                        <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/15 px-4 text-sm hover:bg-white/5">
                          <Upload className="size-4" /> {uploading === f.name ? "…" : "Upload"}
                          <input type="file" accept="image/*,video/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(f.name, e.target.files[0])} />
                        </label>
                      </div>
                    ) : (
                      <Input
                        id={id}
                        type={f.type === "number" || f.type === "money" ? "number" : f.type === "datetime" ? "datetime-local" : f.type === "color" ? "color" : "text"}
                        step={f.type === "money" ? "0.01" : undefined}
                        value={String(v ?? "")}
                        onChange={(e) => set(f.name, e.target.value)}
                        placeholder={f.placeholder}
                        className={f.type === "color" ? "h-12 p-1" : undefined}
                      />
                    )}
                  </Field>
                )}
              </div>
            );
          })}
          {fields.some((f) => f.name === "media_urls") && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-accent-200 sm:col-span-2">
              <Upload className="size-4" /> {uploading === "media_urls[]" ? "Uploading…" : "Upload a gallery image"}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload("media_urls[]", e.target.files[0])} />
            </label>
          )}
        </div>
      </Dialog>
    </div>
  );
}
