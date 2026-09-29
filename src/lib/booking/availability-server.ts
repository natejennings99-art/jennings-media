import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { features } from "@/lib/env";
import type { AvailabilityContext, SlotRules } from "@/lib/scheduling/availability";
import type { BusinessSettings } from "@/lib/types";

/** Loads existing appointments, blocks and crew for a UTC window. */
export async function loadScheduleData(fromIso: string, toIso: string) {
  if (!features.supabaseAdmin) return { appointments: [], blocks: [], photographers: [] };
  const db = createAdminClient();
  const [appointments, blocks, photographers] = await Promise.all([
    db
      .from("appointments")
      .select("starts_at, ends_at, status, hold_expires_at, buffer_before_minutes, buffer_after_minutes, photographer_id")
      .in("status", ["held", "scheduled"])
      .lt("starts_at", toIso)
      .gt("ends_at", fromIso),
    db.from("schedule_blocks").select("starts_at, ends_at, photographer_id").lt("starts_at", toIso).gt("ends_at", fromIso),
    db.from("photographers").select("id, skills, is_active, max_shoots_per_day").eq("is_active", true),
  ]);
  return {
    appointments: appointments.data ?? [],
    blocks: blocks.data ?? [],
    photographers: photographers.data ?? [],
  };
}

export async function buildAvailabilityContext(opts: {
  settings: BusinessSettings;
  durationMinutes: number;
  rules: SlotRules;
  latitude: number | null;
  longitude: number | null;
  fromIso: string;
  toIso: string;
  ignoreLimits?: boolean;
}): Promise<AvailabilityContext> {
  const data = await loadScheduleData(opts.fromIso, opts.toIso);
  return {
    settings: opts.settings.scheduling,
    timeZone: opts.settings.timezone,
    durationMinutes: opts.durationMinutes,
    rules: opts.rules,
    appointments: data.appointments,
    blocks: data.blocks,
    photographers: data.photographers,
    latitude: opts.latitude ?? opts.settings.latitude,
    longitude: opts.longitude ?? opts.settings.longitude,
    ignoreLimits: opts.ignoreLimits,
  };
}
