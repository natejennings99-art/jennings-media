"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, FileText, Film, Link2, PackageCheck, Star, Trash2, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { MEDIA_CATEGORIES } from "@/lib/types";
import { MEDIA_CATEGORY_META } from "@/lib/status";
import { cn, formatBytes } from "@/lib/utils";
import { addExternalMedia, createMediaUpload, deleteMedia, registerMedia, setBookingStatus, updateMedia } from "@/app/admin/actions";

interface AdminMedia {
  id: string;
  category: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_visible: boolean;
  is_featured: boolean;
  viewUrl: string | null;
  external_url: string | null;
}

async function dimensions(file: File) {
  if (!file.type.startsWith("image/")) return { width: null, height: null };
  try {
    const bmp = await createImageBitmap(file);
    const d = { width: bmp.width, height: bmp.height };
    bmp.close();
    return d;
  } catch {
    return { width: null, height: null };
  }
}

export function MediaManager({ bookingId, media, delivered }: { bookingId: string; media: AdminMedia[]; delivered: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [category, setCategory] = useState<string>("photos");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    const supabase = createClient();
    setProgress({ done: 0, total: list.length });
    let failed = 0;
    for (const file of list) {
      try {
        const signed = await createMediaUpload(bookingId, category, file.name, file.type);
        if (!signed.ok) throw new Error(signed.error);
        const { error } = await supabase.storage.from("deliveries").uploadToSignedUrl(signed.data.path, signed.data.token, file, { contentType: file.type || undefined });
        if (error) throw error;
        const dims = await dimensions(file);
        const reg = await registerMedia(bookingId, { path: signed.data.path, category, fileName: file.name, mime: file.type, size: file.size, ...dims });
        if (!reg.ok) throw new Error(reg.error);
      } catch (error) {
        failed++;
        console.error(error);
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    setProgress(null);
    toast(failed ? { tone: "error", title: `${failed} file(s) failed to upload` } : { tone: "success", title: `${list.length} file(s) uploaded` });
    router.refresh();
  }

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast({ tone: "error", title: res.error ?? "Failed" });
      if (success) toast({ tone: "success", title: success });
      router.refresh();
    });

  const counts = MEDIA_CATEGORIES.map((c) => ({ c, n: media.filter((m) => m.category === c).length })).filter((x) => x.n);

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn("rounded-2xl border border-dashed p-6 text-center transition", dragOver ? "border-gold-300 bg-gold-300/5" : "border-white/15")}
      >
        <UploadCloud className="mx-auto size-8 text-gold-300" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-bone-100">Drag files here or choose files</p>
        <p className="text-[12px] text-mist-500">Uploads go straight to secure storage. Clients see files after delivery.</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-40 text-sm">
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {MEDIA_CATEGORY_META[c].label}
              </option>
            ))}
          </Select>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-bone-50 px-5 text-sm font-medium text-ink-950">
            {progress ? `Uploading ${progress.done}/${progress.total}…` : "Choose files"}
            <input type="file" multiple className="sr-only" disabled={Boolean(progress)} onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          </label>
        </div>
        {progress && (
          <div className="mx-auto mt-4 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gold-300 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Matterport / YouTube / Vimeo link" className="h-10 text-sm" />
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-10 text-sm sm:w-48" />
        <Button
          variant="outline"
          size="sm"
          className="h-10"
          loading={pending}
          onClick={() => run(() => addExternalMedia(bookingId, /matterport/i.test(url) ? "tours" : "videos", url, title), "Link added")}
        >
          <Link2 className="size-4" /> Add link
        </Button>
      </div>

      {counts.length > 0 && <p className="text-[13px] text-mist-400">{counts.map((x) => `${x.n} ${MEDIA_CATEGORY_META[x.c].label.toLowerCase()}`).join(" · ")}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {media.map((m) => (
          <div key={m.id} className={cn("overflow-hidden rounded-xl border bg-ink-900", m.is_visible ? "border-white/[0.08]" : "border-dashed border-white/15 opacity-60")}>
            <div className="relative aspect-[4/3]">
              {m.viewUrl && (m.mime_type ?? "").startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.viewUrl} alt={m.file_name} loading="lazy" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-mist-500">
                  {(m.mime_type ?? "").startsWith("video/") ? <Film className="size-7" /> : m.external_url ? <Link2 className="size-7" /> : <FileText className="size-7" />}
                </span>
              )}
              {m.is_featured && <Star className="absolute top-2 left-2 size-4 fill-gold-300 text-gold-300" />}
            </div>
            <div className="flex items-center justify-between gap-1 px-2 py-1.5">
              <span className="min-w-0 truncate text-[11px] text-mist-400" title={m.file_name}>
                {m.file_name} · {m.external_url ? "link" : formatBytes(m.size_bytes)}
              </span>
              <span className="flex shrink-0">
                <button type="button" title="Hero image" onClick={() => run(() => updateMedia(m.id, { is_featured: !m.is_featured }))} className="grid size-7 place-items-center rounded text-mist-500 hover:text-gold-200">
                  <Star className="size-3.5" />
                </button>
                <button type="button" title={m.is_visible ? "Hide from client" : "Show to client"} onClick={() => run(() => updateMedia(m.id, { is_visible: !m.is_visible }))} className="grid size-7 place-items-center rounded text-mist-500 hover:text-bone-50">
                  {m.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </button>
                <button type="button" title="Delete" onClick={() => confirm("Delete this file permanently?") && run(() => deleteMedia(m.id), "Deleted")} className="grid size-7 place-items-center rounded text-mist-500 hover:text-red-300">
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>

      {!delivered && media.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
          <p className="text-sm text-emerald-100">Everything uploaded? Deliver to email the client and unlock downloads.</p>
          <Button size="sm" loading={pending} onClick={() => run(() => setBookingStatus(bookingId, "delivered", true), "Delivered — client notified")}>
            <PackageCheck className="size-4" /> Deliver media
          </Button>
        </div>
      )}
    </div>
  );
}
