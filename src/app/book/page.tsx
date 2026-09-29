import { BookingWizard } from "@/components/booking/wizard";
import { getCatalog, getSettings } from "@/lib/data/public";
import { getViewer } from "@/lib/auth/session";
import { allowedPaymentOptions } from "@/lib/booking/quote-server";
import { features } from "@/lib/env";
import { todayYmd } from "@/lib/scheduling/tz";
import { releaseAbandonedBooking } from "@/lib/booking/payments";

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const params = await searchParams;
  const [catalog, settings, viewer] = await Promise.all([getCatalog(), getSettings(), getViewer()]);
  const c = viewer?.customer;
  const prefill = c
    ? {
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone ?? "",
        company: c.company ?? "",
        brokerage: c.brokerage ?? "",
        sms_opt_in: c.sms_opt_in,
        marketing_opt_in: c.marketing_opt_in,
      }
    : viewer?.user.email
      ? { email: viewer.user.email }
      : null;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const cancelledId = one(params.cancelled);
  const token = one(params.t);
  if (cancelledId && token && features.supabaseAdmin && /^[0-9a-f-]{36}$/.test(cancelledId) && /^[a-f0-9]{32}$/.test(token)) {
    await releaseAbandonedBooking(cancelledId, token).catch((e) => console.error("[book] release failed", e));
  }

  return (
    <BookingWizard
      catalog={catalog}
      timezone={settings.timezone}
      today={todayYmd(settings.timezone)}
      payment={settings.payment_options}
      paymentOptions={allowedPaymentOptions(settings, features.stripe)}
      defaultDurationMinutes={settings.scheduling.default_duration_minutes}
      prefill={prefill}
      signedIn={Boolean(viewer)}
      intent={{
        packageSlug: one(params.package),
        serviceSlug: one(params.service),
        resume: one(params.resume) === "1",
        cancelled: Boolean(one(params.cancelled)),
      }}
    />
  );
}
