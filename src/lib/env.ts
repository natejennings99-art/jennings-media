import { BRAND } from "@/lib/brand";
/**
 * Centralised environment access. Public values (NEXT_PUBLIC_*) are inlined at
 * build time; everything else is server-only.
 */
export const env = {
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    process.env.RENDER_EXTERNAL_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  gaId: process.env.NEXT_PUBLIC_GA4_ID || "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  googleAdsBookingLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOKING_LABEL || "",
};

/** Server-only secrets. Never import this object into a Client Component. */
export const serverEnv = {
  get supabaseSecretKey() {
    return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  },
  get stripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY || "";
  },
  get stripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || "";
  },
  get resendApiKey() {
    return process.env.RESEND_API_KEY || "";
  },
  get emailFrom() {
    return process.env.EMAIL_FROM || `${BRAND.name} <onboarding@resend.dev>`;
  },
  get adminNotificationEmails() {
    return (process.env.ADMIN_NOTIFICATION_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  },
  get adminBootstrapEmails() {
    return (process.env.ADMIN_BOOTSTRAP_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  },
  get cronSecret() {
    return process.env.CRON_SECRET || "";
  },
  get googleMapsApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY || "";
  },
  get twilioConfigured() {
    return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  },
  get showSampleContent() {
    // Fictional demo content is opt-in everywhere now that real work is loaded.
    return process.env.SHOW_SAMPLE_CONTENT === "true";
  },
};

export const features = {
  get supabase() {
    return Boolean(env.supabaseUrl && env.supabasePublishableKey);
  },
  get supabaseAdmin() {
    return Boolean(env.supabaseUrl && serverEnv.supabaseSecretKey);
  },
  get stripe() {
    return Boolean(serverEnv.stripeSecretKey);
  },
  get email() {
    return Boolean(serverEnv.resendApiKey);
  },
};
