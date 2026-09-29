import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { ResourceManager, type FieldDef, type ColumnDef } from "@/components/admin/resource-manager";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

export const metadata = { title: "Discount codes" };

const columns: ColumnDef[] = [
  { key: "code", label: "Code" },
  { key: "discount_value", label: "Discount", format: "percentOrMoney" },
  { key: "usage", label: "Used" },
  { key: "expires_at", label: "Expires", format: "date" },
  { key: "scope", label: "Scope" },
  { key: "is_active", label: "Active", format: "boolean" },
];

export default async function DiscountsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: codes }, { data: referrals }, settings] = await Promise.all([
    supabase.from("promo_codes").select("*, customer:customers(email)").order("created_at", { ascending: false }),
    supabase.from("referrals").select("id, status, reward_cents"),
    getSettings(),
  ]);
  const rows = (codes ?? []).map((c) => ({
    ...c,
    discount_value: c.discount_type === "fixed" ? c.discount_value : c.discount_value,
    usage: `${c.usage_count}${c.usage_limit ? ` / ${c.usage_limit}` : ""}`,
    scope: c.customer ? (c.customer as { email: string }).email : c.first_booking_only ? "First booking" : c.source === "referral_reward" ? "Referral reward" : "Everyone",
  }));
  const fields: FieldDef[] = [
    { name: "code", label: "Code", type: "text", placeholder: "SPRING25" },
    { name: "discount_type", label: "Type", type: "select", options: [{ value: "percent", label: "Percent off" }, { value: "fixed", label: "Fixed $ off" }] },
    { name: "discount_value", label: "Amount (percent or dollars)", type: "number" },
    { name: "description", label: "Internal description", type: "text" },
    { name: "min_subtotal_cents", label: "Minimum subtotal ($)", type: "money" },
    { name: "max_discount_cents", label: "Maximum discount ($)", type: "money" },
    { name: "starts_at", label: "Starts", type: "datetime" },
    { name: "expires_at", label: "Expires", type: "datetime" },
    { name: "usage_limit", label: "Total uses allowed", type: "number" },
    { name: "per_customer_limit", label: "Uses per customer", type: "number" },
    { name: "customer_id", label: "Limit to one customer (ID)", type: "text", hint: "Paste a customer ID from Customers, or leave blank" },
    { name: "first_booking_only", label: "First booking only", type: "boolean" },
    { name: "is_active", label: "Active", type: "boolean" },
  ];
  const program = settings.referral_program;
  const rewarded = (referrals ?? []).filter((r) => r.status === "rewarded");
  return (
    <div className="space-y-8">
      <PageTitle title="Discount codes" description="Promo codes, customer-specific offers and referral rewards." />
      <Card className="grid gap-6 p-6 sm:grid-cols-4">
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Referral program</p>
          <p className="mt-1 text-xl">{program.enabled ? "On" : "Off"}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">New client gets</p>
          <p className="mt-1 text-xl">{program.referee_discount_type === "percent" ? `${program.referee_discount_value}%` : formatMoney(program.referee_discount_value)}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Referrer earns</p>
          <p className="mt-1 text-xl">{formatMoney(program.referrer_reward_cents)}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-wide text-mist-500 uppercase">Rewards issued</p>
          <p className="mt-1 text-xl">
            {rewarded.length} · {formatMoney(rewarded.reduce((s, r) => s + r.reward_cents, 0))}
          </p>
          <Link href="/admin/settings?tab=referrals" className="text-[13px] text-accent-200 hover:underline">
            Configure
          </Link>
        </div>
      </Card>
      <ResourceManager resource="promo_codes" title="Code" rows={rows} columns={columns} fields={fields} searchKeys={["code", "description"]} defaults={{ discount_type: "percent", discount_value: 10, min_subtotal_cents: 0, is_active: true, first_booking_only: false }} />
    </div>
  );
}
