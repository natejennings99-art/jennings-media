import { Mail, MessageSquare } from "lucide-react";
import { BRAND } from "@/lib/brand";

const sms = BRAND.phoneHref.replace(/^tel:/, "sms:");

/** Until lead email is connected a submitted form only reaches the server log, so the visitor gets one tap to send it straight to Nate. */
export function LeadHandoff({ subject, lines }: { subject: string; lines: string[] }) {
  const body = lines.filter(Boolean).join("\n");
  const button = "inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-[14px] font-semibold text-bone-50 hover:border-accent-300";
  return (
    <div className="mt-8 max-w-md rounded-2xl border border-accent-300/40 bg-white/[0.02] p-6">
      <p className="text-[16px] font-semibold text-bone-50">One tap gets this to Nate fastest</p>
      <p className="mt-2 text-[15px] leading-relaxed text-mist-300">Your details are filled in. Just press send.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={`${sms}?&body=${encodeURIComponent(`${subject}\n${body}`)}`} className={button}>
          <MessageSquare className="size-4" /> Text {BRAND.phone}
        </a>
        <a href={`mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`} className={button}>
          <Mail className="size-4" /> Email instead
        </a>
      </div>
    </div>
  );
}
