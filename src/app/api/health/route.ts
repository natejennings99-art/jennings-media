import { NextResponse } from "next/server";
import { features } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    services: { supabase: features.supabase, supabaseAdmin: features.supabaseAdmin, stripe: features.stripe, email: features.email },
  });
}
