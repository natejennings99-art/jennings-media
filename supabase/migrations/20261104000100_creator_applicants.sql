-- =============================================================================
-- Creator network: photographers and videographers who apply through /join
-- =============================================================================
-- Rows are written by the server (service role) from the /join form and read or
-- updated only by admins (Admin → Creators). Visitors never touch the table directly.

create table if not exists public.creator_applicants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  discipline text not null check (discipline in ('photo', 'video', 'both')),
  portfolio_url text not null,
  gear text,
  -- Whole US dollars per day, as typed by the applicant.
  day_rate integer check (day_rate is null or day_rate between 0 and 100000),
  availability text,
  notes text,
  status text not null default 'applied' check (status in ('applied', 'contacted', 'trial_shoot', 'active', 'no')),
  admin_notes text,
  source_path text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists creator_applicants_status_idx on public.creator_applicants (status, created_at desc);
create index if not exists creator_applicants_ip_idx on public.creator_applicants (ip_hash, created_at desc);
create index if not exists creator_applicants_email_idx on public.creator_applicants (lower(email));

drop trigger if exists creator_applicants_updated_at on public.creator_applicants;
create trigger creator_applicants_updated_at
  before update on public.creator_applicants
  for each row execute function public.set_updated_at();

alter table public.creator_applicants enable row level security;
create policy "Admins have full access" on public.creator_applicants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant all on public.creator_applicants to service_role;
grant select, insert, update, delete on public.creator_applicants to authenticated;
revoke all on public.creator_applicants from anon;
