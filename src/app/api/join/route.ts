import { submitCreatorApplication } from "@/lib/leads/creator";
import { describe, readBody, respond } from "@/lib/leads/http";

export const dynamic = "force-dynamic";

/** GET is a cheap uptime probe; POST takes the same fields as the /join form. */
export function GET() {
  return describe("/api/join", ["name", "email", "phone", "discipline (photo|video|both)", "portfolio_url", "day_rate", "gear?", "availability[]?", "availability_notes?", "notes?"]);
}

export async function POST(request: Request) {
  return respond(await submitCreatorApplication(await readBody(request, ["availability"])));
}
