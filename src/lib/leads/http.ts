import "server-only";
import { NextResponse } from "next/server";
import type { ActionResult } from "@/lib/types";

/**
 * Shared plumbing for the JSON lead endpoints (/api/contact, /api/join, /api/content-package).
 * Each accepts `application/json` or a form post and reuses the Server Action logic, so a GET
 * is a cheap uptime probe and a POST behaves exactly like the on-page form.
 */
export async function readBody(request: Request, arrayFields: string[] = []): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!json || typeof json !== "object") return {};
    for (const f of arrayFields) {
      const v = json[f];
      if (typeof v === "string") json[f] = v.split(",").map((s) => s.trim()).filter(Boolean);
      else if (v == null) json[f] = [];
    }
    return json;
  }
  const form = await request.formData().catch(() => null);
  if (!form) return {};
  const out: Record<string, unknown> = Object.fromEntries(form);
  for (const f of arrayFields) out[f] = form.getAll(f).map(String);
  return out;
}

export function describe(path: string, fields: string[]) {
  return NextResponse.json({ ok: true, endpoint: path, accepts: "POST (application/json or form data)", fields }, { headers: { "Cache-Control": "no-store" } });
}

export function respond(result: ActionResult<unknown>) {
  if (result.ok) return NextResponse.json({ ok: true, ...(result.data ? { data: result.data } : {}) }, { status: 200 });
  const status = result.fieldErrors ? 422 : /sent a few/.test(result.error) ? 429 : 400;
  return NextResponse.json({ ok: false, error: result.error, ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}) }, { status });
}
