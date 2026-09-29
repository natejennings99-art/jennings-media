import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager } from "@/components/admin/resource-manager";
import { serviceColumns, serviceDefaults, serviceFields } from "@/lib/admin/catalog-fields";

export const metadata = { title: "Services" };

export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return (
    <div>
      <PageTitle title="Services" description="Everything customers can book. Changes appear on the website within seconds." />
      <ResourceManager resource="services" title="Service" rows={data ?? []} columns={serviceColumns} fields={serviceFields} defaults={serviceDefaults} uploadFolder="services" />
    </div>
  );
}
