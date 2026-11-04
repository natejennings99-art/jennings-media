"use server";

import { submitCreatorApplication, type CreatorResult } from "@/lib/leads/creator";

/** Server Action behind the /join form; POST /api/join runs the same logic. */
export async function submitJoin(_: unknown, form: FormData): Promise<CreatorResult> {
  return submitCreatorApplication({ ...Object.fromEntries(form), availability: form.getAll("availability").map(String) });
}
