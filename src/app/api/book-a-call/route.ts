import { submitCallBooking } from "@/lib/leads/call";
import { describe, readBody, respond } from "@/lib/leads/http";

export const dynamic = "force-dynamic";

/** GET is a cheap uptime probe; POST takes the same fields as the "Book a call" form. */
export function GET() {
  return describe("/api/book-a-call", ["name", "phone", "best_time (Morning|Midday|Afternoon|Evening)", "business?", "email?", "topic? (Photo|Video|Social content|Not sure yet)", "note?"]);
}

export async function POST(request: Request) {
  return respond(await submitCallBooking(await readBody(request)));
}
