"use client";

import { useEffect } from "react";
import { track, trackAdsConversion } from "@/lib/analytics";
import { env } from "@/lib/env";

/** Fires the booking conversion once per order (guarded against reloads). */
export function ConversionTracker({ orderId, valueCents }: { orderId: string; valueCents: number }) {
  useEffect(() => {
    const key = `jm-conv-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    track("booking_complete", { transaction_id: orderId, value: valueCents / 100, currency: "USD" });
    if (env.googleAdsId && env.googleAdsBookingLabel) trackAdsConversion(`${env.googleAdsId}/${env.googleAdsBookingLabel}`, valueCents, orderId);
  }, [orderId, valueCents]);
  return null;
}
