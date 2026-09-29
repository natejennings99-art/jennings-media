import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * SMS channel (Twilio). Dormant until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and
 * TWILIO_FROM_NUMBER are set AND SMS is enabled in Admin → Settings → Notifications.
 * Uses Twilio's REST API directly, so no extra dependency is required.
 */
export async function sendSms(to: string, body: string): Promise<{ status: "sent" | "failed" | "skipped"; id?: string; error?: string }> {
  if (!serverEnv.twilioConfigured) return { status: "skipped", error: "Twilio not configured" };
  const digits = to.replace(/[^\d+]/g, "");
  const e164 = digits.startsWith("+") ? digits : `+1${digits.replace(/^1/, "")}`;
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: e164, From: process.env.TWILIO_FROM_NUMBER!, Body: body }),
    });
    const json = (await res.json()) as { sid?: string; message?: string };
    return res.ok ? { status: "sent", id: json.sid } : { status: "failed", error: json.message ?? `HTTP ${res.status}` };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}
