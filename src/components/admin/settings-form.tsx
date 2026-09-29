"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { saveSettings } from "@/app/admin/actions";
import type { BusinessSettings } from "@/lib/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-3 text-sm">
      <span>
        {label}
        {hint && <span className="block text-[12px] text-mist-500">{hint}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

export function SettingsForm({ tab, settings, twilioReady }: { tab: string; settings: BusinessSettings; twilioReady: boolean }) {
  const [s, setS] = useState(settings);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const set = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => setS((prev) => ({ ...prev, [key]: value }));
  const setIn = <K extends keyof BusinessSettings>(key: K, patch: Partial<BusinessSettings[K]>) => setS((prev) => ({ ...prev, [key]: { ...(prev[key] as object), ...patch } }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const save = (keys: (keyof BusinessSettings)[]) =>
    start(async () => {
      const res = await saveSettings(Object.fromEntries(keys.map((k) => [k, s[k]])));
      toast(res.ok ? { tone: "success", title: "Settings saved" } : { tone: "error", title: res.error });
      if (res.ok) router.refresh();
    });

  if (tab === "business")
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {(["business_name", "legal_name", "tagline", "email", "phone", "address_line1", "city", "state", "postal_code"] as const).map((k) => (
          <Field key={k} label={k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())} htmlFor={k}>
            <Input id={k} value={(s[k] as string | null) ?? ""} onChange={(e) => set(k, e.target.value || (k === "business_name" ? "" : null) as never)} />
          </Field>
        ))}
        <Field label="Timezone (IANA)" htmlFor="tz" hint="e.g. America/New_York, America/Chicago">
          <Input id="tz" value={s.timezone} onChange={(e) => set("timezone", e.target.value)} />
        </Field>
        <Field label="Latitude" htmlFor="lat" hint="Default location for sunset times">
          <Input id="lat" type="number" step="0.0001" value={s.latitude ?? ""} onChange={(e) => set("latitude", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        <Field label="Longitude" htmlFor="lng">
          <Input id="lng" type="number" step="0.0001" value={s.longitude ?? ""} onChange={(e) => set("longitude", e.target.value ? Number(e.target.value) : null)} />
        </Field>
        {(["instagram", "facebook", "youtube", "linkedin"] as const).map((k) => (
          <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} URL`} htmlFor={k}>
            <Input id={k} value={s.social_links[k] ?? ""} onChange={(e) => setIn("social_links", { [k]: e.target.value })} />
          </Field>
        ))}
        <div className="sm:col-span-2">
          <Button loading={pending} onClick={() => save(["business_name", "legal_name", "tagline", "email", "phone", "address_line1", "city", "state", "postal_code", "timezone", "latitude", "longitude", "social_links"])}>Save business profile</Button>
        </div>
      </div>
    );

  if (tab === "scheduling") {
    const sc = s.scheduling;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          {DAYS.map((day, i) => {
            const intervals = sc.working_hours[String(i)] ?? [];
            const open = intervals.length > 0;
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 px-4 py-2.5">
                <span className="w-28 text-sm">{day}</span>
                <Switch checked={open} onChange={(v) => setIn("scheduling", { working_hours: { ...sc.working_hours, [String(i)]: v ? [{ start: "08:00", end: "18:00" }] : [] } })} label={`${day} open`} />
                {open && (
                  <>
                    <Input type="time" value={intervals[0].start} onChange={(e) => setIn("scheduling", { working_hours: { ...sc.working_hours, [String(i)]: [{ ...intervals[0], start: e.target.value }] } })} className="h-9 w-32 text-sm" />
                    <span className="text-mist-500">to</span>
                    <Input type="time" value={intervals[0].end} onChange={(e) => setIn("scheduling", { working_hours: { ...sc.working_hours, [String(i)]: [{ ...intervals[0], end: e.target.value }] } })} className="h-9 w-32 text-sm" />
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {(
            [
              ["max_shoots_per_day", "Max shoots per day"],
              ["travel_buffer_minutes", "Travel buffer (min)"],
              ["slot_interval_minutes", "Slot interval (min)"],
              ["default_duration_minutes", "Default duration (min)"],
              ["min_notice_hours", "Minimum notice (hours)"],
              ["max_advance_days", "Book up to (days ahead)"],
              ["hold_minutes", "Checkout hold (min)"],
              ["twilight_lead_minutes", "Twilight start before sunset (min)"],
            ] as const
          ).map(([k, label]) => (
            <Field key={k} label={label} htmlFor={k}>
              <Input id={k} type="number" min={0} value={sc[k]} onChange={(e) => setIn("scheduling", { [k]: num(e.target.value) })} />
            </Field>
          ))}
        </div>
        <p className="text-[13px] text-mist-500">Service-specific rules (daylight-only drone, sunset-timed twilight, extra notice for 3D scans, required crew skills) live on each service in Admin → Services.</p>
        <Button loading={pending} onClick={() => save(["scheduling"])}>Save scheduling</Button>
      </div>
    );
  }

  if (tab === "payments") {
    const p = s.payment_options;
    const a = s.service_area_policy;
    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="Pay in full" checked={p.allow_full} onChange={(v) => setIn("payment_options", { allow_full: v })} />
          <Toggle label="Deposit" checked={p.allow_deposit} onChange={(v) => setIn("payment_options", { allow_deposit: v })} />
          <Toggle label="Pay after shoot" checked={p.allow_pay_later} onChange={(v) => setIn("payment_options", { allow_pay_later: v })} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Deposit type" htmlFor="dt">
            <Select id="dt" value={p.deposit_type} onChange={(e) => setIn("payment_options", { deposit_type: e.target.value as "percent" | "fixed" })}>
              <option value="percent">Percent of total</option>
              <option value="fixed">Fixed amount</option>
            </Select>
          </Field>
          <Field label={p.deposit_type === "percent" ? "Deposit %" : "Deposit ($)"} htmlFor="dv">
            <Input id="dv" type="number" min={0} value={p.deposit_type === "percent" ? p.deposit_value : p.deposit_value / 100} onChange={(e) => setIn("payment_options", { deposit_value: p.deposit_type === "percent" ? num(e.target.value) : Math.round(num(e.target.value) * 100) })} />
          </Field>
          <Field label="Tax rate (%)" htmlFor="tax">
            <Input id="tax" type="number" step="0.01" min={0} value={s.tax_rate_bps / 100} onChange={(e) => set("tax_rate_bps", Math.round(num(e.target.value) * 100))} />
          </Field>
          <Field label="Tax label" htmlFor="tl">
            <Input id="tl" value={s.tax_label} onChange={(e) => set("tax_label", e.target.value)} />
          </Field>
          <Field label="Pay-later note" htmlFor="pln" className="sm:col-span-2">
            <Input id="pln" value={p.pay_later_note} onChange={(e) => setIn("payment_options", { pay_later_note: e.target.value })} />
          </Field>
        </div>
        <Toggle label="Charge tax on travel fees" checked={s.tax_travel_fee} onChange={(v) => set("tax_travel_fee", v)} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Outside service area" htmlFor="oap">
            <Select id="oap" value={a.outside_area_policy} onChange={(e) => setIn("service_area_policy", { outside_area_policy: e.target.value as "quote" | "reject" })}>
              <option value="quote">Allow with extended travel fee</option>
              <option value="reject">Block online booking</option>
            </Select>
          </Field>
          <Field label="Extended travel base fee ($)" htmlFor="oaf">
            <Input id="oaf" type="number" min={0} value={a.outside_area_fee_cents / 100} onChange={(e) => setIn("service_area_policy", { outside_area_fee_cents: Math.round(num(e.target.value) * 100) })} />
          </Field>
          <Field label="Road-distance factor" htmlFor="rdf" hint="Straight-line miles × this">
            <Input id="rdf" type="number" step="0.05" min={1} value={a.road_distance_factor} onChange={(e) => setIn("service_area_policy", { road_distance_factor: num(e.target.value) })} />
          </Field>
        </div>
        <Button loading={pending} onClick={() => save(["payment_options", "tax_rate_bps", "tax_label", "tax_travel_fee", "service_area_policy"])}>Save payments & tax</Button>
      </div>
    );
  }

  if (tab === "notifications") {
    const n = s.notifications;
    return (
      <div className="space-y-5">
        <Field label="Admin alert emails (one per line)" htmlFor="ae">
          <Textarea id="ae" rows={3} value={n.admin_emails.join("\n")} onChange={(e) => setIn("notifications", { admin_emails: e.target.value.split(/\n|,/).map((x) => x.trim()).filter(Boolean) })} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Reminder lead time (hours)" htmlFor="rh">
            <Input id="rh" type="number" min={1} value={n.reminder_hours_before} onChange={(e) => setIn("notifications", { reminder_hours_before: num(e.target.value) })} />
          </Field>
          <Field label="Reply-to address" htmlFor="rt">
            <Input id="rt" type="email" value={n.reply_to} onChange={(e) => setIn("notifications", { reply_to: e.target.value })} />
          </Field>
        </div>
        <Toggle label="SMS reminders" hint={twilioReady ? "Twilio connected" : "Add TWILIO_* environment variables to enable"} checked={n.sms_enabled} onChange={(v) => setIn("notifications", { sms_enabled: v })} />
        <Button loading={pending} onClick={() => save(["notifications"])}>Save notifications</Button>
      </div>
    );
  }

  if (tab === "referrals") {
    const r = s.referral_program;
    return (
      <div className="space-y-5">
        <Toggle label="Referral program enabled" checked={r.enabled} onChange={(v) => setIn("referral_program", { enabled: v })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Referrer reward ($ off next shoot)" htmlFor="rr">
            <Input id="rr" type="number" min={0} value={r.referrer_reward_cents / 100} onChange={(e) => setIn("referral_program", { referrer_reward_cents: Math.round(num(e.target.value) * 100) })} />
          </Field>
          <Field label="Reward when the referred booking is…" htmlFor="rq">
            <Select id="rq" value={r.qualify_on} onChange={(e) => setIn("referral_program", { qualify_on: e.target.value as "paid" | "delivered" })}>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
            </Select>
          </Field>
          <Field label="New client discount type" htmlFor="rdt">
            <Select id="rdt" value={r.referee_discount_type} onChange={(e) => setIn("referral_program", { referee_discount_type: e.target.value as "percent" | "fixed" })}>
              <option value="fixed">Fixed $</option>
              <option value="percent">Percent</option>
            </Select>
          </Field>
          <Field label={r.referee_discount_type === "percent" ? "New client discount %" : "New client discount ($)"} htmlFor="rdv">
            <Input id="rdv" type="number" min={0} value={r.referee_discount_type === "percent" ? r.referee_discount_value : r.referee_discount_value / 100} onChange={(e) => setIn("referral_program", { referee_discount_value: r.referee_discount_type === "percent" ? num(e.target.value) : Math.round(num(e.target.value) * 100) })} />
          </Field>
        </div>
        <Button loading={pending} onClick={() => save(["referral_program"])}>Save referral program</Button>
      </div>
    );
  }

  if (tab === "integrations") {
    const a = s.analytics;
    return (
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["ga4_id", "Google Analytics 4 ID", "G-XXXXXXX"],
              ["meta_pixel_id", "Meta Pixel ID", "1234567890"],
              ["google_ads_id", "Google Ads ID", "AW-XXXXXXX"],
              ["google_ads_booking_label", "Google Ads booking conversion label", "abcDEF123"],
            ] as const
          ).map(([k, label, ph]) => (
            <Field key={k} label={label} htmlFor={k}>
              <Input id={k} value={a[k]} placeholder={ph} onChange={(e) => setIn("analytics", { [k]: e.target.value.trim() })} />
            </Field>
          ))}
        </div>
        <p className="text-[13px] text-mist-500">Environment variables (NEXT_PUBLIC_*) take priority over these values. Booking conversions fire on the confirmation page.</p>
        <Button loading={pending} onClick={() => save(["analytics"])}>Save integrations</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Field label="Homepage hero image URL" htmlFor="hi" hint="Upload in Admin → Portfolio or Services and paste the URL, or use any https image.">
        <Input id="hi" value={s.hero_image_url ?? ""} onChange={(e) => set("hero_image_url", e.target.value || null)} />
      </Field>
      <Field label="Homepage hero video URL (.mp4)" htmlFor="hv" hint="Muted, looping background reel. Keep it under ~15 MB.">
        <Input id="hv" value={s.hero_video_url ?? ""} onChange={(e) => set("hero_video_url", e.target.value || null)} />
      </Field>
      <Button loading={pending} onClick={() => save(["hero_image_url", "hero_video_url"])}>Save website</Button>
    </div>
  );
}
