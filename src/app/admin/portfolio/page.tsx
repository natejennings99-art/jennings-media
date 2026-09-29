import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef, type ColumnDef } from "@/components/admin/resource-manager";
import { SampleBanner } from "@/components/admin/sample-banner";
import { PORTFOLIO_CATEGORIES } from "@/lib/types";

export const metadata = { title: "Portfolio" };

const columns: ColumnDef[] = [
  { key: "cover_image_url", label: "", format: "image", className: "w-14" },
  { key: "title", label: "Project" },
  { key: "categories", label: "Categories", format: "list" },
  { key: "is_featured", label: "Featured", format: "boolean" },
  { key: "is_published", label: "Published", format: "boolean" },
  { key: "is_sample", label: "Sample", format: "boolean" },
];

export default async function AdminPortfolioPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("portfolio_projects").select("*, portfolio_media(url, kind, sort_order)").order("sort_order");
  const rows = (data ?? []).map(({ portfolio_media, ...p }) => ({
    ...p,
    media_urls: (portfolio_media as { url: string; kind: string; sort_order: number }[]).sort((a, b) => a.sort_order - b.sort_order).map((m) => (m.kind === "photo" ? m.url : `${m.url} | ${m.kind}`)),
  }));
  const fields: FieldDef[] = [
    { name: "title", label: "Property name", type: "text" },
    { name: "slug", label: "URL slug", type: "text" },
    { name: "neighborhood", label: "Neighborhood / area", type: "text" },
    { name: "property_type", label: "Property type", type: "text" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "categories", label: `Categories (${PORTFOLIO_CATEGORIES.join(", ")})`, type: "list" },
    { name: "services_performed", label: "Services performed (one per line)", type: "list" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "cover_image_url", label: "Cover image", type: "image" },
    { name: "media_urls", label: "Gallery (one URL per line; append \"| drone\" or \"| video\")", type: "list" },
    { name: "video_url", label: "Film (YouTube / Vimeo link)", type: "text", wide: true },
    { name: "tour_url", label: "3D tour (Matterport link)", type: "text", wide: true },
    { name: "is_featured", label: "Featured on homepage", type: "boolean" },
    { name: "is_published", label: "Published", type: "boolean" },
    { name: "is_sample", label: "Sample content (hidden in production)", type: "boolean" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];
  const samples = rows.filter((r) => r.is_sample && r.is_published).length;
  return (
    <div>
      <PageTitle title="Portfolio" description="Projects shown on the homepage and portfolio. Upload images or paste links." />
      <SampleBanner count={samples} kind="portfolio projects" />
      <ResourceManager resource="portfolio_projects" title="Project" rows={rows} columns={columns} fields={fields} searchKeys={["title", "neighborhood"]} uploadFolder="portfolio" defaults={{ categories: [], services_performed: [], media_urls: [], is_published: true, is_featured: false, is_sample: false, sort_order: 100 }} />
    </div>
  );
}
