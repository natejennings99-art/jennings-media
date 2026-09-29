"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileText, Film, Loader2, Play } from "lucide-react";
import type { SignedMedia } from "@/lib/data/customer";
import { MEDIA_CATEGORIES } from "@/lib/types";
import { MEDIA_CATEGORY_META } from "@/lib/status";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Lightbox } from "@/components/marketing/lightbox";

const isImage = (m: SignedMedia) => (m.mime_type ?? "").startsWith("image/") || /\.(jpe?g|png|webp|avif|gif)$/i.test(m.file_name);
const isVideo = (m: SignedMedia) => (m.mime_type ?? "").startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(m.file_name);

async function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function MediaGallery({ media, zipName, shareUrl }: { media: SignedMedia[]; zipName: string; shareUrl?: string | null }) {
  const toast = useToast();
  const categories = MEDIA_CATEGORIES.filter((c) => media.some((m) => m.category === c));
  const [tab, setTab] = useState(categories[0] ?? "photos");
  const [zipping, setZipping] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const items = useMemo(() => media.filter((m) => m.category === tab), [media, tab]);
  const images = items.filter(isImage);

  async function downloadAll(scope: SignedMedia[], label: string) {
    const files = scope.filter((m) => m.storage_path && m.downloadUrl);
    if (!files.length) return;
    setZipping(label);
    try {
      const { downloadZip } = await import("client-zip");
      const entries = files.map((m) => ({
        name: `${MEDIA_CATEGORY_META[m.category]?.label ?? m.category}/${m.file_name}`,
        input: fetch(m.viewUrl!),
      }));
      const blob = await downloadZip(
        (async function* () {
          for (const e of entries) {
            const res = await e.input;
            yield { name: e.name, input: res };
          }
        })()
      ).blob();
      await saveBlob(blob, `${zipName}${label === "all" ? "" : `-${label}`}.zip`);
      toast({ tone: "success", title: "Download ready", description: `${files.length} files zipped.` });
    } catch (error) {
      console.error(error);
      toast({ tone: "error", title: "Couldn't build the zip", description: "Try downloading files individually." });
    } finally {
      setZipping(null);
    }
  }

  if (!media.length) return null;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={tab === c}
              onClick={() => setTab(c)}
              className={cn("h-9 shrink-0 rounded-full px-4 text-[13px] transition", tab === c ? "bg-bone-50 text-ink-950" : "border border-white/10 text-mist-300 hover:text-bone-50")}
            >
              {MEDIA_CATEGORY_META[c].label} <span className="opacity-60">{media.filter((m) => m.category === c).length}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {shareUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="size-4 text-emerald-300" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy share link"}
            </Button>
          )}
          <Button size="sm" onClick={() => downloadAll(media, "all")} loading={zipping === "all"} disabled={Boolean(zipping)}>
            {zipping !== "all" && <Download className="size-4" />} Download all
          </Button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((m) => {
          const imageIndex = images.indexOf(m);
          return (
            <div key={m.id} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900">
              <button type="button" className="relative block aspect-[4/3] w-full" onClick={() => (imageIndex >= 0 ? setLightbox(imageIndex) : m.viewUrl && window.open(m.viewUrl, "_blank", "noopener"))}>
                {isImage(m) && m.viewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.viewUrl} alt={m.title ?? m.file_name} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <span className="grid size-full place-items-center text-mist-400">
                    {isVideo(m) ? <Film className="size-8" /> : m.external_url ? <ExternalLink className="size-7" /> : <FileText className="size-8" />}
                  </span>
                )}
                {isVideo(m) && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-11 place-items-center rounded-full bg-ink-950/60 backdrop-blur">
                      <Play className="size-4 fill-current" />
                    </span>
                  </span>
                )}
              </button>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="min-w-0 truncate text-[12px] text-mist-400" title={m.file_name}>
                  {m.title ?? m.file_name}
                  <span className="text-mist-600"> · {m.external_url ? "Link" : formatBytes(m.size_bytes)}</span>
                </p>
                {m.downloadUrl && (
                  <a href={m.downloadUrl} className="grid size-8 shrink-0 place-items-center rounded-lg text-mist-400 transition hover:bg-white/10 hover:text-bone-50" aria-label={`Download ${m.file_name}`} {...(m.external_url ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {m.external_url ? <ExternalLink className="size-4" /> : <Download className="size-4" />}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {items.filter((m) => m.storage_path).length > 1 && (
        <button type="button" onClick={() => downloadAll(items, tab)} disabled={Boolean(zipping)} className="mt-4 inline-flex items-center gap-2 text-[13px] text-accent-200 hover:underline disabled:opacity-50">
          {zipping === tab ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />} Download all {MEDIA_CATEGORY_META[tab].label.toLowerCase()}
        </button>
      )}
      <Lightbox items={images.map((m) => ({ src: m.viewUrl!, alt: m.title ?? m.file_name, title: m.title ?? m.file_name }))} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
    </div>
  );
}
