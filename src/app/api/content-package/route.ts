import { submitCallRequest } from "@/lib/leads/content-package";
import { describe, readBody, respond } from "@/lib/leads/http";

export const dynamic = "force-dynamic";

/** GET is a cheap uptime probe; POST takes the same fields as the /content-package form. */
export function GET() {
  return describe("/api/content-package", ["name", "business", "phone", "best_time (Morning|Midday|Afternoon|Evening)", "email?"]);
}

export async function POST(request: Request) {
  return respond(await submitCallRequest(await readBody(request)));
}
