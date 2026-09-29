import type { ColumnDef, FieldDef } from "@/components/admin/resource-manager";
import { ICON_NAMES } from "@/components/ui/icon";

export const iconOptions = [{ value: "", label: "Default" }, ...ICON_NAMES.map((i) => ({ value: i, label: i }))];
export const pricingModels = [
  { value: "flat", label: "Flat price" },
  { value: "sqft", label: "By square footage (tiers)" },
  { value: "per_unit", label: "Per unit" },
];

export const serviceColumns: ColumnDef[] = [
  { key: "image_url", label: "", format: "image", className: "w-14" },
  { key: "name", label: "Service" },
  { key: "category", label: "Category", format: "badge" },
  { key: "base_price_cents", label: "Base", format: "money" },
  { key: "duration_minutes", label: "Minutes" },
  { key: "is_bookable", label: "Bookable", format: "boolean" },
  { key: "is_active", label: "Active", format: "boolean" },
];

export const serviceFields: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "URL slug", type: "text", hint: "e.g. drone-photography" },
  {
    name: "category", label: "Category", type: "select",
    options: ["photography", "video", "drone", "tour", "floor_plan", "editing", "web", "marketing", "branding"].map((c) => ({ value: c, label: c.replace("_", " ") })),
  },
  { name: "icon", label: "Icon", type: "select", options: iconOptions },
  { name: "tagline", label: "Short description", type: "text", wide: true },
  { name: "description", label: "Full description", type: "textarea" },
  { name: "features", label: "Features (one per line)", type: "list" },
  { name: "image_url", label: "Cover image", type: "image" },
  { name: "pricing_model", label: "Pricing model", type: "select", options: pricingModels },
  { name: "base_price_cents", label: "Base / unit price ($)", type: "money" },
  { name: "price_tiers", label: "Price by home size", type: "tiers", when: { field: "pricing_model", in: ["sqft"] } },
  { name: "unit_label", label: "Unit label", type: "text", placeholder: "image", when: { field: "pricing_model", in: ["per_unit"] } },
  { name: "max_quantity", label: "Max quantity", type: "number", when: { field: "pricing_model", in: ["per_unit"] } },
  { name: "duration_minutes", label: "On-site minutes", type: "number", hint: "0 for studio-only services" },
  { name: "turnaround_hours", label: "Turnaround (hours)", type: "number" },
  { name: "scheduling_rules", label: "Scheduling rules (JSON)", type: "json", hint: 'Keys: daylight_only, twilight, min_notice_hours, requires_skill — e.g. {"daylight_only": true, "requires_skill": "drone"}' },
  { name: "is_bookable", label: "Bookable online", type: "boolean" },
  { name: "is_addon_eligible", label: "Available as an add-on", type: "boolean" },
  { name: "is_featured", label: "Featured", type: "boolean" },
  { name: "is_active", label: "Active", type: "boolean" },
  { name: "sort_order", label: "Sort order", type: "number" },
  { name: "seo_title", label: "SEO title", type: "text" },
  { name: "seo_description", label: "SEO description", type: "text", wide: true },
];

export const serviceDefaults = {
  category: "photography", pricing_model: "flat", base_price_cents: 0, price_tiers: [], duration_minutes: 30, scheduling_rules: {},
  features: [], is_bookable: true, is_addon_eligible: true, is_featured: false, is_active: true, sort_order: 100,
};

export const packageColumns: ColumnDef[] = [
  { key: "name", label: "Package" },
  { key: "base_price_cents", label: "From", format: "money" },
  { key: "service_ids", label: "Services", format: "count" },
  { key: "badge", label: "Badge" },
  { key: "is_featured", label: "Featured", format: "boolean" },
  { key: "is_active", label: "Active", format: "boolean" },
];

export const addOnColumns: ColumnDef[] = [
  { key: "name", label: "Add-on" },
  { key: "linked", label: "Linked service" },
  { key: "price_cents", label: "Price", format: "money" },
  { key: "trigger_service_ids", label: "Shown for", format: "count" },
  { key: "show_always", label: "Always", format: "boolean" },
  { key: "is_active", label: "Active", format: "boolean" },
];
