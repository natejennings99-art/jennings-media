import { submitContactLead } from "@/lib/leads/contact";
import { describe, readBody, respond } from "@/lib/leads/http";

export const dynamic = "force-dynamic";

/** GET is a cheap uptime probe; POST takes the same fields as the contact form. */
export function GET() {
  return describe("/api/contact", ["name", "email", "need", "budget", "message", "company?", "phone?", "services[]?"]);
}

export async function POST(request: Request) {
  return respond(await submitContactLead(await readBody(request, ["services"])));
}
