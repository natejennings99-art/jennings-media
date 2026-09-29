import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef, type ColumnDef } from "@/components/admin/resource-manager";
import { SampleBanner } from "@/components/admin/sample-banner";

export const metadata = { title: "Clients" };

const columns: ColumnDef[] = [
  { key: "logo_url", label: "", format: "image", className: "w-14" },
  { key: "name", label: "Client" },
  { key: "is_published", label: "Published", format: "boolean" },
  { key: "is_sample", label: "Sample", format: "boolean" },
  { key: "sort_order", label: "Order" },
];

const fields: FieldDef[] = [
  { name: "name", label: "Client name", type: "text" },
  { name: "logo_url", label: "Logo (optional — shown as a wordmark without one)", type: "image" },
  { name: "website_url", label: "Website", type: "text", wide: true },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "is_published", label: "Show in the \"Trusted by\" strip", type: "boolean" },
  { name: "is_sample", label: "Sample content (hidden in production)", type: "boolean" },
];

export default async function AdminClientsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clients").select("*").order("sort_order");
  const rows = data ?? [];
  const samples = rows.filter((r) => r.is_sample && r.is_published).length;
  return (
    <div>
      <PageTitle title="Clients" description="Brands in the homepage “Trusted by” strip. Only list clients you've actually worked with." />
      <SampleBanner count={samples} kind="clients" />
      <ResourceManager resource="clients" title="Client" rows={rows} columns={columns} fields={fields} searchKeys={["name"]} uploadFolder="clients" defaults={{ is_published: true, is_sample: false, sort_order: 100 }} />
    </div>
  );
}
