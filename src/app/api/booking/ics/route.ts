import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { features, env } from "@/lib/env";
import { fullAddress } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Downloadable calendar invite for a booked shoot. */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  if (!features.supabaseAdmin || !/^[0-9a-f-]{36}$/.test(id) || !/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { data } = await createAdminClient()
    .from("bookings")
    .select("order_number, property:properties(*), appointments(starts_at, ends_at, status)")
    .eq("id", id)
    .eq("share_token", token)
    .maybeSingle();
  const appt = (data?.appointments as { starts_at: string; ends_at: string; status: string }[] | undefined)?.find((a) => a.status !== "cancelled");
  if (!data || !appt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const address = fullAddress(data.property as unknown as Parameters<typeof fullAddress>[0]);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BRAND.name}//Booking//EN`,
    "BEGIN:VEVENT",
    `UID:${id}@jenningsmedia`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(appt.starts_at)}`,
    `DTEND:${stamp(appt.ends_at)}`,
    `SUMMARY:${escapeIcs(`${BRAND.name} shoot · ${data.order_number}`)}`,
    `LOCATION:${escapeIcs(address)}`,
    `DESCRIPTION:${escapeIcs(`Order ${data.order_number}. Manage: ${env.siteUrl}/dashboard/orders/${id}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${data.order_number}.ics"`,
    },
  });
}
