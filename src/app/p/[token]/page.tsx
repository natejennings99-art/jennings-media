import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Mail, Maximize, Phone } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import { signMedia } from "@/lib/data/customer";
import { embedUrl, isDirectVideo } from "@/lib/media-embed";
import { PropertyGallery } from "@/components/dashboard/property-gallery";
import { Logo } from "@/components/ui/misc";
import { PROPERTY_TYPE_LABELS } from "@/lib/status";
import { formatPhone } from "@/lib/utils";
import type { Customer, MediaItem, Property } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

async function load(token: string) {
  if (!features.supabaseAdmin || !/^[a-f0-9]{32}$/.test(token)) return null;
  const { data } = await createAdminClient()
    .from("bookings")
    .select("id, status, customer:customers(first_name, last_name, email, phone, company, brokerage), property:properties(*), media(*)")
    .eq("share_token", token)
    .maybeSingle();
  if (!data || data.status !== "delivered") return null;
  return data as unknown as { id: string; customer: Customer; property: Property; media: MediaItem[] };
}

export default async function PropertyWebsite({ params, searchParams }: PageProps<"/p/[token]">) {
  const { token } = await params;
  const { mls } = (await searchParams) as { mls?: string };
  const unbranded = mls === "1";
  const data = await load(token);
  if (!data) notFound();
  const media = await signMedia(data.media.filter((m) => m.is_visible).sort((a, b) => a.sort_order - b.sort_order), 60 * 60 * 6);
  const photos = media.filter((m) => ["photos", "drone"].includes(m.category) && (m.mime_type ?? "image/").startsWith("image/"));
  const hero = media.find((m) => m.is_featured && m.viewUrl) ?? photos[0];
  const videos = media.filter((m) => m.category === "videos" || (m.category === "drone" && (m.mime_type ?? "").startsWith("video/")));
  const tours = media.filter((m) => m.category === "tours" && m.external_url);
  const plans = media.filter((m) => m.category === "floor_plans");
  const p = data.property;
  const agent = data.customer;

  return (
    <div className="min-h-dvh">
      <section className="relative isolate flex min-h-[85svh] items-end overflow-hidden">
        {hero?.viewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero.viewUrl} alt={p.address_line1} className="absolute inset-0 -z-20 size-full animate-kenburns object-cover" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <div className="container-page pb-14">
          <p className="eyebrow">{PROPERTY_TYPE_LABELS[p.property_type]}</p>
          <h1 className="mt-4 text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] font-medium tracking-[-0.05em]">{p.address_line1}</h1>
          <p className="mt-3 text-lg text-mist-300">
            {p.city}, {p.state} {p.postal_code}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {p.bedrooms ? <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm"><BedDouble className="size-4" /> {p.bedrooms} beds</span> : null}
            {p.bathrooms ? <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Bath className="size-4" /> {p.bathrooms} baths</span> : null}
            {p.square_feet ? <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Maximize className="size-4" /> {p.square_feet.toLocaleString()} sq ft</span> : null}
          </div>
        </div>
      </section>

      <div className="container-page space-y-16 py-16">
        {videos.map((v) => {
          const embed = embedUrl(v.external_url);
          return (
            <div key={v.id} className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10">
              {embed ? (
                <iframe src={embed} title={v.title ?? "Property film"} className="absolute inset-0 size-full" allowFullScreen allow="autoplay; fullscreen" />
              ) : v.viewUrl && (isDirectVideo(v.file_name) || (v.mime_type ?? "").startsWith("video/")) ? (
                <video src={v.viewUrl} controls playsInline className="absolute inset-0 size-full bg-black object-contain" />
              ) : null}
            </div>
          );
        })}

        {photos.length > 0 && <PropertyGallery photos={photos.map((m) => ({ src: m.viewUrl!, alt: m.title ?? p.address_line1 }))} />}

        {tours.map((t) => {
          const embed = embedUrl(t.external_url);
          return embed ? (
            <div key={t.id}>
              <h2 className="mb-5 text-2xl font-medium tracking-[-0.03em]">3D tour</h2>
              <div className="relative aspect-video overflow-hidden rounded-[28px] border border-white/10">
                <iframe src={embed} title="3D tour" className="absolute inset-0 size-full" allow="xr-spatial-tracking; fullscreen" allowFullScreen />
              </div>
            </div>
          ) : null;
        })}

        {plans.length > 0 && (
          <div>
            <h2 className="mb-5 text-2xl font-medium tracking-[-0.03em]">Floor plans</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((f) =>
                f.viewUrl && (f.mime_type ?? "").startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f.id} src={f.viewUrl} alt={f.title ?? "Floor plan"} className="w-full rounded-3xl bg-white p-4" />
                ) : (
                  <a key={f.id} href={f.viewUrl ?? "#"} target="_blank" rel="noreferrer" className="surface rounded-3xl p-6 text-gold-200 hover:underline">
                    {f.title ?? f.file_name}
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {!unbranded && (
          <div className="surface flex flex-col justify-between gap-6 rounded-[28px] p-8 sm:flex-row sm:items-center">
            <div>
              <p className="eyebrow">Presented by</p>
              <p className="mt-2 text-2xl font-medium">
                {agent.first_name} {agent.last_name}
              </p>
              <p className="text-mist-400">{[agent.brokerage, agent.company].filter(Boolean).join(" · ")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {agent.phone && (
                <a href={`tel:${agent.phone}`} className="glass flex items-center gap-2 rounded-full px-5 py-3 text-sm">
                  <Phone className="size-4" /> {formatPhone(agent.phone)}
                </a>
              )}
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 rounded-full bg-bone-50 px-5 py-3 text-sm font-medium text-ink-950">
                <Mail className="size-4" /> Contact agent
              </a>
            </div>
          </div>
        )}
      </div>

      {!unbranded && (
        <footer className="border-t border-white/[0.07] py-8">
          <div className="container-page flex items-center justify-between text-[13px] text-mist-500">
            <span>Media by</span>
            <Link href="/" aria-label="Jennings Media">
              <Logo />
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
