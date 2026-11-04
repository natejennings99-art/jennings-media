"use server";

import { submitCallRequest, type CallRequestResult } from "@/lib/leads/content-package";

/** Server Action behind the /content-package "book a call" form; POST /api/content-package runs the same logic. */
export async function submitContentPackageCall(_: unknown, form: FormData): Promise<CallRequestResult> {
  return submitCallRequest(Object.fromEntries(form));
}
