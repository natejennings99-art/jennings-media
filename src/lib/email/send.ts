import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import { features, serverEnv } from "@/lib/env";
import type { EmailContent } from "./templates";

export interface SendResult {
  status: "sent" | "failed" | "skipped";
  provider: "resend" | "dev-outbox";
  id?: string;
  error?: string;
}

let resend: Resend | null = null;

/**
 * Sends a transactional email through Resend. Without RESEND_API_KEY (local dev),
 * emails are written to ./.outbox as HTML files so every template can be previewed.
 */
export async function sendEmail(to: string | string[], content: EmailContent, opts: { replyTo?: string | null; tags?: Record<string, string> } = {}): Promise<SendResult> {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) return { status: "skipped", provider: "resend", error: "No recipient" };

  if (!features.email) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`[email] RESEND_API_KEY missing — skipped "${content.subject}"`);
      return { status: "skipped", provider: "resend", error: "RESEND_API_KEY not configured" };
    }
    try {
      const dir = join(process.cwd(), ".outbox");
      await mkdir(dir, { recursive: true });
      const file = `${new Date().toISOString().replace(/[:.]/g, "-")}-${content.subject.replace(/[^a-z0-9]+/gi, "-").slice(0, 60)}.html`;
      await writeFile(join(dir, file), `<!-- To: ${recipients.join(", ")} -->\n${content.html}`);
      console.info(`[email:dev] "${content.subject}" → ${recipients.join(", ")} (.outbox/${file})`);
      return { status: "sent", provider: "dev-outbox", id: file };
    } catch (error) {
      return { status: "failed", provider: "dev-outbox", error: String(error) };
    }
  }

  try {
    resend ??= new Resend(serverEnv.resendApiKey);
    const { data, error } = await resend.emails.send({
      from: serverEnv.emailFrom,
      to: recipients,
      subject: content.subject,
      html: content.html,
      text: content.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      ...(opts.tags ? { tags: Object.entries(opts.tags).map(([name, value]) => ({ name, value })) } : {}),
    });
    if (error) return { status: "failed", provider: "resend", error: error.message };
    return { status: "sent", provider: "resend", id: data?.id };
  } catch (error) {
    return { status: "failed", provider: "resend", error: error instanceof Error ? error.message : String(error) };
  }
}
