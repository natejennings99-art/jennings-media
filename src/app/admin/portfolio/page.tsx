import { requireAdmin } from "@/lib/auth/session";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef, type ColumnDef } from "@/components/admin/resource-manager";
import { SampleBanner } from "@/components/admin/sample-banner";
import { PORTFOLIO_CATEGORIES } from "@/lib/types";

export const metadata = { title: "Work" };

const columns: ColumnDef[] = [
  { key: "cover_image_url", label: "", format: "image", className: "w-14" },
  { key: "title", label: "Project" },
  { key: "client_name", label: "Client" },
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
    metrics: ((p.metrics ?? []) as { value: string; label: string }[]).map((m) => `${m.value} | ${m.label}`),
    media_urls: (portfolio_media as { url: string; kind: string; sort_order: number }[]).sort((a, b) => a.sort_order - b.sort_order).map((m) => (m.kind === "photo" ? m.url : `${m.url} | ${m.kind}`)),
  }));
  const fields: FieldDef[] = [
    { name: "title", label: "Project title", type: "text" },
    { name: "slug", label: "URL slug", type: "text" },
    { name: "client_name", label: "Client", type: "text" },
    { name: "industry", label: "Industry", type: "text" },
    { name: "year", label: "Year", type: "number" },
    { name: "city", label: "City", type: "text" },
    { name: "state", label: "State", type: "text" },
    { name: "neighborhood", label: "Neighborhood / area (listings)", type: "text" },
    { name: "property_type", label: "Property type (listings)", type: "text" },
    { name: "headline", label: "Case-study headline", type: "text", wide: true },
    { name: "summary", label: "Summary (card + overview)", type: "textarea" },
    { name: "categories", label: `Categories (${PORTFOLIO_CATEGORIES.join(", ")})`, type: "list" },
    { name: "services_performed", label: "Services performed (one per line)", type: "list" },
    { name: "metrics", label: "Results metrics — one per line: value | label (e.g. +212% | Direct bookings)", type: "list" },
    { name: "challenge", label: "Challenge", type: "textarea" },
    { name: "strategy", label: "Strategy", type: "textarea" },
    { name: "execution", label: "Creative execution", type: "textarea" },
    { name: "results", label: "Results (real numbers only)", type: "textarea" },
    { name: "testimonial_quote", label: "Client quote", type: "textarea" },
    { name: "testimonial_author", label: "Quote — name", type: "text" },
    { name: "testimonial_role", label: "Quote — role / company", type: "text" },
    { name: "description", label: "Short description (fallback)", type: "textarea" },
    { name: "cover_image_url", label: "Cover image", type: "image" },
    { name: "hover_video_url", label: "Hover / preview video (.mp4)", type: "text", wide: true },
    { name: "media_urls", label: "Gallery (one URL per line; append \"| drone\" or \"| video\")", type: "list" },
    { name: "video_url", label: "Film (YouTube / Vimeo link or .mp4)", type: "text", wide: true },
    { name: "tour_url", label: "3D tour (Matterport link)", type: "text", wide: true },
    { name: "is_featured", label: "Featured on homepage", type: "boolean" },
    { name: "is_published", label: "Published", type: "boolean" },
    { name: "is_sample", label: "Sample content (hidden in production)", type: "boolean" },
    { name: "sort_order", label: "Sort order", type: "number" },
  ];
  const samples = rows.filter((r) => r.is_sample && r.is_published).length;
  return (
    <div>
      <PageTitle title="Work" description="Case studies shown on the homepage, /work and service pages. Only add results and quotes you can back up." />
      <SampleBanner count={samples} kind="portfolio projects" />
      <ResourceManager resource="portfolio_projects" title="Project" rows={rows} columns={columns} fields={fields} searchKeys={["title", "client_name", "industry"]} uploadFolder="portfolio" defaults={{ categories: [], services_performed: [], metrics: [], media_urls: [], is_published: true, is_featured: false, is_sample: false, sort_order: 100 }} />
    </div>
  );
}
