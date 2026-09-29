import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings, mergeSettings } from "@/lib/data/public";
import { serverEnv } from "@/lib/env";
import { PageTitle } from "@/components/dashboard/shell";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { ResourceManager, type ColumnDef, type FieldDef } from "@/components/admin/resource-manager";
import { cn } from "@/lib/utils";
import type { BusinessSettings } from "@/lib/types";

export const metadata = { title: "Settings" };

const TABS = [
  { key: "business", label: "Business" },
  { key: "scheduling", label: "Scheduling" },
  { key: "blocked", label: "Blocked dates" },
  { key: "areas", label: "Service areas" },
  { key: "team", label: "Team" },
  { key: "payments", label: "Payments & tax" },
  { key: "notifications", label: "Notifications" },
  { key: "referrals", label: "Referrals" },
  { key: "integrations", label: "Integrations" },
  { key: "website", label: "Website" },
];

const areaColumns: ColumnDef[] = [
  { key: "name", label: "Area" },
  { key: "kind", label: "Kind", format: "badge" },
  { key: "cities", label: "Cities", format: "list" },
  { key: "travel_fee_cents", label: "Base fee", format: "money" },
  { key: "per_mile_cents", label: "Per mile", format: "money" },
  { key: "is_active", label: "Active", format: "boolean" },
];
const areaFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "market", label: "Market", type: "text", hint: "Group areas into markets for future locations" },
  { name: "kind", label: "Kind", type: "select", options: [{ value: "primary", label: "Primary" }, { value: "additional", label: "Additional city" }, { value: "travel_zone", label: "Travel zone" }] },
  { name: "state", label: "State (2 letters)", type: "text" },
  { name: "cities", label: "Cities (one per line)", type: "list" },
  { name: "postal_codes", label: "ZIP codes (one per line)", type: "list" },
  { name: "center_latitude", label: "Center latitude", type: "number" },
  { name: "center_longitude", label: "Center longitude", type: "number" },
  { name: "radius_miles", label: "Radius (miles)", type: "number" },
  { name: "travel_fee_cents", label: "Flat travel fee ($)", type: "money" },
  { name: "per_mile_cents", label: "Per mile beyond free miles ($)", type: "money" },
  { name: "free_miles", label: "Free miles", type: "number" },
  { name: "priority", label: "Priority (lower wins)", type: "number" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "notes", label: "Notes", type: "textarea" },
];
const teamColumns: ColumnDef[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "skills", label: "Skills", format: "list" },
  { key: "is_active", label: "Active", format: "boolean" },
];
const teamFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "email", label: "Email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "color", label: "Calendar color", type: "color" },
  { name: "skills", label: "Skills (drone, video, tour — one per line)", type: "list", hint: "Services requiring a skill are only scheduled against crew who have it." },
  { name: "max_shoots_per_day", label: "Max shoots per day", type: "number" },
  { name: "bio", label: "Bio", type: "textarea" },
  { name: "is_active", label: "Active", type: "boolean" },
];
const blockColumns: ColumnDef[] = [
  { key: "starts_at", label: "Starts", format: "date" },
  { key: "ends_at", label: "Ends", format: "date" },
  { key: "reason", label: "Reason" },
  { key: "who", label: "Applies to" },
];

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const { tab = "business" } = (await searchParams) as { tab?: string };
  const { supabase } = await requireAdmin();
  const current = TABS.some((t) => t.key === tab) ? tab : "business";
  const { data: row } = await supabase.from("business_settings").select("*").eq("id", 1).maybeSingle();
  const settings = row ? mergeSettings(row as Partial<BusinessSettings>) : await getSettings();

  let body: React.ReactNode = null;
  if (current === "areas") {
    const { data } = await supabase.from("service_areas").select("*").order("priority");
    body = <ResourceManager resource="service_areas" title="Service area" rows={data ?? []} columns={areaColumns} fields={areaFields} defaults={{ kind: "additional", cities: [], postal_codes: [], travel_fee_cents: 0, per_mile_cents: 0, free_miles: 0, priority: 100, is_active: true, state: settings.state }} />;
  } else if (current === "team") {
    const { data } = await supabase.from("photographers").select("*").order("name");
    body = <ResourceManager resource="photographers" title="Team member" rows={data ?? []} columns={teamColumns} fields={teamFields} defaults={{ color: "#ff5b24", skills: [], is_active: true }} />;
  } else if (current === "blocked") {
    const [{ data }, { data: crew }] = await Promise.all([supabase.from("schedule_blocks").select("*, photographer:photographers(name)").order("starts_at", { ascending: false }), supabase.from("photographers").select("id, name")]);
    const rows = (data ?? []).map((b) => ({ ...b, who: (b.photographer as { name: string } | null)?.name ?? "Whole business" }));
    const fields: FieldDef[] = [
      { name: "starts_at", label: "Starts", type: "datetime" },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "reason", label: "Reason", type: "text", placeholder: "Holiday, vacation, equipment service…" },
      { name: "photographer_id", label: "Applies to", type: "select", options: [{ value: "", label: "Whole business" }, ...(crew ?? []).map((c) => ({ value: c.id, label: c.name }))] },
      { name: "all_day", label: "All day", type: "boolean" },
    ];
    body = <ResourceManager resource="schedule_blocks" title="Blocked time" rows={rows} columns={blockColumns} fields={fields} searchKeys={["reason"]} defaults={{ all_day: true, photographer_id: "" }} />;
  } else {
    body = (
      <Card className="p-6 sm:p-8">
        <SettingsForm tab={current} settings={settings} twilioReady={serverEnv.twilioConfigured} />
      </Card>
    );
  }

  return (
    <div>
      <PageTitle title="Settings" description="Everything that shapes pricing, scheduling and communication." />
      <div className="no-scrollbar mb-6 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/settings?tab=${t.key}`} className={cn("h-9 shrink-0 rounded-full px-4 text-[13px] leading-9", current === t.key ? "bg-bone-50 text-ink-950" : "border border-white/10 text-mist-400 hover:text-bone-50")}>
            {t.label}
          </Link>
        ))}
      </div>
      <div key={current}>{body}</div>
    </div>
  );
}
