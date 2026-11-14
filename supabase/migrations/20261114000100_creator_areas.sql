-- =============================================================================
-- Creator network: the areas an applicant covers (asked on /join)
-- =============================================================================
-- Free text, as typed ("Tampa, St. Pete, Clearwater"). Safe to run more than once.
-- Until this is applied the site still saves applications: it writes the areas into
-- the notes instead.

alter table public.creator_applicants add column if not exists areas text;
