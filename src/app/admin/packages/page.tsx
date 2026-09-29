import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef } from "@/components/admin/resource-manager";
import { packageColumns } from "@/lib/admin/catalog-fields";

export const metadata = { title: "Packages" };

export default async function AdminPackagesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: packages }, { data: services }] = await Promise.all([
    supabase.from("packages").select("*, package_services(service_id)").order("sort_order"),
    supabase.from("services").select("id, name").order("sort_order"),
  ]);
  const rows = (packages ?? []).map(({ package_services, ...p }) => ({ ...p, service_ids: (package_services as { service_id: string }[]).map((s) => s.service_id) }));
  const fields: FieldDef[] = [
    { name: "name", label: "Name", type: "text" },
    { name: "slug", label: "URL slug", type: "text" },
    { name: "tagline", label: "Tagline", type: "text", wide: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "service_ids", label: "Included services", type: "multiselect", options: (services ?? []).map((s) => ({ value: s.id, label: s.name })) },
    { name: "features", label: "Feature bullets (one per line)", type: "list" },
    { name: "base_price_cents", label: "Base price ($)", type: "money" },
    { name: "price_tiers", label: "Price by home size", type: "tiers" },
    { name: "badge", label: "Badge", type: "text", placeholder: "Most popular" },
    { name: "turnaround_text", label: "Turnaround text", type: "text" },
    { name: "image_url", label: "Image", type: "image" },
    { name: "is_featured", label: "Highlight on pricing", type: "boolean" },
    { name: "is_active", label: "Active", type: "boolean" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];
  return (
    <div>
      <PageTitle title="Packages" description="Bundles offered on the pricing page and recommended during booking." />
      <ResourceManager resource="packages" title="Package" rows={rows} columns={packageColumns} fields={fields} defaults={{ price_tiers: [], features: [], service_ids: [], is_active: true, is_featured: false, sort_order: 100 }} uploadFolder="packages" />
    </div>
  );
}
