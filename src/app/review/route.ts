import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

/**
 * jennings-media.com/review: a short link Nate shares himself (text, email signature, QR card)
 * that opens the Google "write a review" box. The site never sends it to anyone. Until the
 * Google review link is set in brand.ts it goes to the homepage. Not in the sitemap.
 */
export function GET(request: Request) {
  return NextResponse.redirect(BRAND.googleReviewUrl || new URL("/", request.url), 307);
}
