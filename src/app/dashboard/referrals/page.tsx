import { Gift } from "lucide-react";
import { requireCustomer } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { CopyButton } from "@/components/dashboard/client-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Stat } from "@/components/ui/misc";
import { env } from "@/lib/env";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";
import type { PromoCode, Referral } from "@/lib/types";

export const metadata = { title: "Refer & earn" };

export default async function ReferralsPage() {
  const { customer, supabase } = await requireCustomer("/dashboard/referrals");
  const settings = await getSettings();
  const program = settings.referral_program;
  const [{ data: referrals }, { data: rewards }] = await Promise.all([
    supabase.from("referrals").select("*").order("created_at", { ascending: false }),
    supabase.from("promo_codes").select("*").eq("source", "referral_reward").order("created_at", { ascending: false }),
  ]);
  const list = (referrals ?? []) as Referral[];
  const codes = (rewards ?? []) as PromoCode[];
  const code = customer?.referral_code ?? "";
  const link = `${env.siteUrl}/book?ref=${code}`;
  const refereeOffer = program.referee_discount_type === "percent" ? `${program.referee_discount_value}% off` : `${formatMoney(program.referee_discount_value)} off`;

  if (!program.enabled) {
    return <EmptyState icon={<Gift className="size-5" />} title="Referral program coming soon" />;
  }
  return (
    <div className="space-y-8">
      <PageTitle title="Refer & earn" description={`Give colleagues ${refereeOffer} their first shoot. Get ${formatMoney(program.referrer_reward_cents)} off your next one when they book.`} />
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-accent-300/10 blur-3xl" />
        <p className="eyebrow">Your referral code</p>
        <p className="mt-3 font-mono text-4xl tracking-[0.12em] text-accent-100">{code}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <CopyButton value={code} label="Copy code" />
          <CopyButton value={link} label="Copy booking link" />
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Referrals" value={list.length} />
        <Stat label="Rewarded" value={list.filter((r) => r.status === "rewarded").length} />
        <Stat label="Earned" value={formatMoney(list.reduce((s, r) => s + (r.status === "rewarded" ? r.reward_cents : 0), 0))} />
      </div>
      {codes.length > 0 && (
        <Card className="p-6">
          <p className="font-medium">Your reward codes</p>
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {codes.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-mono text-accent-100">{c.code}</span>
                <span className="text-mist-400">{formatMoney(c.discount_value)} off</span>
                <Badge tone={c.usage_count > 0 ? "neutral" : "green"}>{c.usage_count > 0 ? "Used" : "Available"}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
      {list.length > 0 && (
        <Card className="p-6">
          <p className="font-medium">Referral history</p>
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {list.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <span className="text-mist-300">{r.referred_email ?? "New client"}</span>
                <span className="text-mist-500">{formatDate(r.created_at)}</span>
                <Badge tone={r.status === "rewarded" ? "green" : r.status === "void" ? "neutral" : "amber"}>{titleCase(r.status)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
