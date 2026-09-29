import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef } from "@/components/admin/resource-manager";
import { addOnColumns, iconOptions, pricingModels } from "@/lib/admin/catalog-fields";
import { Card } from "@/components/ui/card";
import { buttonStyles } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Pricing & add-ons" };

export default async function AdminPricingPage() {
  const { supabase } = await requireAdmin();
  const [{ data: addOns }, { data: services }, settings] = await Promise.all([
    supabase.from("add_ons").select("*, add_on_triggers(service_id)").order("sort_order"),
    supabase.from("services").select("id, name").order("sort_order"),
    getSettings(),
  ]);
  const names = new Map((services ?? []).map((s) => [s.id, s.name]));
  const rows = (addOns ?? []).map(({ add_on_triggers, ...a }) => ({
    ...a,
    linked: a.service_id ? names.get(a.service_id) ?? "—" : "—",
    trigger_service_ids: (add_on_triggers as { service_id: string }[]).map((t) => t.service_id),
  }));
  const serviceOptions = (services ?? []).map((s) => ({ value: s.id, label: s.name }));
  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text" },
    { name: "slug", label: "Slug", type: "text" },
    { name: "description", label: "Description", type: "text", wide: true },
    { name: "service_id", label: "Linked service (uses its price)", type: "select", options: [{ value: "", label: "— Standalone add-on —" }, ...serviceOptions] },
    { name: "pricing_model", label: "Pricing model", type: "select", options: pricingModels.filter((p) => p.value !== "sqft") },
    { name: "price_cents", label: "Price ($)", type: "money", hint: "Ignored when linked to a service" },
    { name: "unit_label", label: "Unit label", type: "text" },
    { name: "max_quantity", label: "Max quantity", type: "number" },
    { name: "duration_minutes", label: "Extra on-site minutes", type: "number" },
    { name: "icon", label: "Icon", type: "select", options: iconOptions },
    { name: "trigger_service_ids", label: "Offer when these are booked", type: "multiselect", options: serviceOptions },
    { name: "show_always", label: "Offer on every order", type: "boolean" },
    { name: "is_active", label: "Active", type: "boolean" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];
  const p = settings.payment_options;
  return (
    <div className="space-y-10">
      <PageTitle title="Pricing & add-ons" description="Size-based pricing lives on each service and package. Add-ons are offered contextually during booking." />
      <Card className="grid gap-6 p-6 sm:grid-cols-4">
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Tax</p>
          <p className="mt-1 text-xl">{(settings.tax_rate_bps / 100).toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Deposit</p>
          <p className="mt-1 text-xl">{p.deposit_type === "percent" ? `${p.deposit_value}%` : formatMoney(p.deposit_value)}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Outside-area fee</p>
          <p className="mt-1 text-xl">{formatMoney(settings.service_area_policy.outside_area_fee_cents)}</p>
        </div>
        <div className="flex items-end">
          <Link href="/admin/settings?tab=payments" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Edit payment & tax settings
          </Link>
        </div>
      </Card>
      <div>
        <h2 className="mb-4 text-lg font-medium">Add-ons</h2>
        <ResourceManager resource="add_ons" title="Add-on" rows={rows} columns={addOnColumns} fields={fields} defaults={{ pricing_model: "flat", price_cents: 0, duration_minutes: 0, trigger_service_ids: [], is_active: true, show_always: false, sort_order: 100, service_id: "" }} />
      </div>
      <p className="text-sm text-mist-500">
        Travel fees are configured per zone in{" "}
        <Link href="/admin/settings?tab=areas" className="text-accent-200 hover:underline">
          Settings → Service areas
        </Link>
        .
      </p>
    </div>
  );
}
