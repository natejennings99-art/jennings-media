import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { LeadsBoard } from "@/components/admin/leads-board";

export const metadata = { title: "Contact leads" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const { focus } = (await searchParams) as { focus?: string };
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data } = await supabase.from("contact_leads").select("*").order("created_at", { ascending: false }).limit(300);
  return (
    <div>
      <PageTitle title="Contact leads" description="Inquiries from the contact form and client support requests." />
      <LeadsBoard leads={data ?? []} focus={focus ?? null} timezone={settings.timezone} />
    </div>
  );
}
