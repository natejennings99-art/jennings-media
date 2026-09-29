import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Appointment, Booking, BookingEvent, BookingLineItem, Invoice, MediaItem, Payment, Property } from "@/lib/types";

export type BookingSummary = Booking & { property: Property; appointments: Appointment[]; items: BookingLineItem[] };
export type BookingDetail = BookingSummary & { invoices: Invoice[]; events: BookingEvent[]; media: MediaItem[]; payments: Payment[] };

export function nextAppointment(b: { appointments: Appointment[] }) {
  return (b.appointments ?? []).filter((a) => a.status !== "cancelled").sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] ?? null;
}

/** All bookings for the signed-in customer (RLS-scoped client). */
export async function listCustomerBookings(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("bookings")
    .select("*, property:properties(*), appointments(*), items:booking_services(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as BookingSummary[];
}

export async function getCustomerBooking(supabase: SupabaseClient, id: string) {
  const { data } = await supabase
    .from("bookings")
    .select("*, property:properties(*), appointments(*), items:booking_services(*), invoices(*), events:booking_events(*), media(*), payments(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const b = data as BookingDetail;
  b.items = [...(b.items ?? [])].sort((x, y) => x.sort_order - y.sort_order);
  b.media = [...(b.media ?? [])].sort((x, y) => x.sort_order - y.sort_order || x.created_at.localeCompare(y.created_at));
  b.events = [...(b.events ?? [])].sort((x, y) => y.created_at.localeCompare(x.created_at));
  return b;
}

export interface SignedMedia extends MediaItem {
  viewUrl: string | null;
  downloadUrl: string | null;
}

/**
 * Short-lived signed URLs for private delivery files. Callers must pass media rows
 * already authorized by RLS (customer) or an admin check.
 */
export async function signMedia(items: MediaItem[], expiresIn = 60 * 60): Promise<SignedMedia[]> {
  const stored = items.filter((m) => m.storage_path);
  if (!stored.length) return items.map((m) => ({ ...m, viewUrl: m.external_url, downloadUrl: m.external_url }));
  const bucket = createAdminClient().storage.from("deliveries");
  const paths = stored.map((m) => m.storage_path!);
  const [view, download] = await Promise.all([bucket.createSignedUrls(paths, expiresIn), bucket.createSignedUrls(paths, expiresIn, { download: true })]);
  const viewMap = new Map((view.data ?? []).map((d) => [d.path, d.signedUrl]));
  const downloadMap = new Map((download.data ?? []).map((d) => [d.path, d.signedUrl]));
  return items.map((m) =>
    m.storage_path
      ? { ...m, viewUrl: viewMap.get(m.storage_path) ?? null, downloadUrl: downloadMap.get(m.storage_path) ?? null }
      : { ...m, viewUrl: m.external_url, downloadUrl: m.external_url }
  );
}
