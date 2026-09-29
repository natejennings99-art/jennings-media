import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { features } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (features.supabase) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(`${request.nextUrl.origin}/`, { status: 303 });
}
