import { requireAdmin } from "@/lib/auth/session";
import { getSettings } from "@/lib/data/public";
import { PageTitle } from "@/components/dashboard/shell";
import { CreatorsBoard } from "@/components/admin/creators-board";
import type { CreatorApplicant } from "@/lib/types";

export const metadata = { title: "Creators" };

/** Photographers and videographers who applied through /join. */
export default async function CreatorsPage({ searchParams }: PageProps<"/admin/creators">) {
  const { focus } = (await searchParams) as { focus?: string };
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data, error } = await supabase.from("creator_applicants").select("*").order("created_at", { ascending: false }).limit(300);
  return (
    <div>
      <PageTitle title="Creators" description="Photographers and videographers who applied at /join. Move each one from applied to contacted, trial shoot and active (or no)." />
      {error ? (
        <p className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200">
          Could not load applicants: {error.message}. If this says the table does not exist, apply <code>supabase/migrations/20261104000100_creator_applicants.sql</code> in the Supabase SQL editor.
        </p>
      ) : (
        <CreatorsBoard applicants={(data ?? []) as CreatorApplicant[]} focus={focus ?? null} timezone={settings.timezone} />
      )}
    </div>
  );
}
