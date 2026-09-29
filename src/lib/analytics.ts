"use client";

type Params = Record<string, string | number | boolean | undefined>;
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Fire a conversion/analytics event to whichever trackers are loaded. */
export function track(event: "begin_booking" | "booking_step" | "booking_complete" | "contact_submit" | "sign_up", params: Params = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, params);
  const pixelEvents: Record<string, string> = {
    begin_booking: "InitiateCheckout",
    booking_complete: "Purchase",
    contact_submit: "Lead",
    sign_up: "CompleteRegistration",
  };
  if (pixelEvents[event]) window.fbq?.("track", pixelEvents[event], params);
}

/** Google Ads conversion (booking completed). */
export function trackAdsConversion(sendTo: string | undefined, valueCents: number, orderId: string) {
  if (!sendTo || typeof window === "undefined") return;
  window.gtag?.("event", "conversion", { send_to: sendTo, value: valueCents / 100, currency: "USD", transaction_id: orderId });
}
