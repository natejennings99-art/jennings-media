-- =============================================================================
-- Agency repositioning: case studies, client logos, project inquiries, stats
-- =============================================================================

-- Case-study fields on portfolio projects (the agency "Work" section).
alter table public.portfolio_projects
  add column if not exists client_name text,
  add column if not exists industry text,
  add column if not exists year integer check (year is null or year between 1990 and 2100),
  add column if not exists headline text,
  add column if not exists summary text,
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists challenge text,
  add column if not exists strategy text,
  add column if not exists execution text,
  add column if not exists results text,
  add column if not exists hover_video_url text,
  add column if not exists testimonial_quote text,
  add column if not exists testimonial_author text,
  add column if not exists testimonial_role text;

-- Client logos for the trust marquee.
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  -- Sample content is hidden in production unless SHOW_SAMPLE_CONTENT=true.
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Admins have full access" on public.clients
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Public can read published clients" on public.clients
  for select to anon, authenticated using (is_published);
grant select on public.clients to anon, authenticated;
grant insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
revoke insert, update, delete, truncate on public.clients from anon;

-- Project inquiries from the agency contact form.
alter table public.contact_leads
  add column if not exists need text,
  add column if not exists services text[] not null default '{}',
  add column if not exists budget text;
alter table public.contact_leads drop constraint if exists contact_leads_reason_check;
alter table public.contact_leads add constraint contact_leads_reason_check check (reason in (
  'project', 'booking', 'pricing', 'custom_quote', 'partnership', 'support', 'general'
));

-- Marketing site content managed from Admin → Settings → Website
-- { stats: [{prefix, value, suffix, label}], stats_are_sample, trust_line }
alter table public.business_settings
  add column if not exists marketing jsonb not null default '{}'::jsonb;
