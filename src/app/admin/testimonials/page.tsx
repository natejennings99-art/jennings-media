import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef, type ColumnDef } from "@/components/admin/resource-manager";
import { SampleBanner } from "@/components/admin/sample-banner";

export const metadata = { title: "Testimonials" };

const columns: ColumnDef[] = [
  { key: "author_name", label: "Author" },
  { key: "author_title", label: "Title" },
  { key: "rating", label: "Rating" },
  { key: "is_published", label: "Published", format: "boolean" },
  { key: "is_sample", label: "Sample", format: "boolean" },
];

const fields: FieldDef[] = [
  { name: "author_name", label: "Name", type: "text" },
  { name: "author_title", label: "Role", type: "text", placeholder: "Listing Agent" },
  { name: "company", label: "Brokerage / company", type: "text" },
  { name: "rating", label: "Rating (1–5)", type: "number" },
  { name: "quote", label: "Quote", type: "textarea" },
  { name: "avatar_url", label: "Photo", type: "image" },
  { name: "is_featured", label: "Featured", type: "boolean" },
  { name: "is_published", label: "Published", type: "boolean" },
  { name: "is_sample", label: "Sample content (hidden in production)", type: "boolean", hint: "Only publish real client reviews — FTC rules prohibit fabricated testimonials." },
  { name: "sort_order", label: "Sort order", type: "number" },
];

export default async function AdminTestimonialsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  const rows = data ?? [];
  return (
    <div>
      <PageTitle title="Testimonials" description="Reviews from real clients, shown on the homepage." />
      <SampleBanner count={rows.filter((r) => r.is_sample && r.is_published).length} kind="testimonials" />
      <ResourceManager resource="testimonials" title="Testimonial" rows={rows} columns={columns} fields={fields} searchKeys={["author_name", "quote"]} uploadFolder="testimonials" defaults={{ rating: 5, is_published: true, is_featured: true, is_sample: false, sort_order: 100 }} />
    </div>
  );
}
