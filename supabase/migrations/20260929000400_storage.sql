-- =============================================================================
-- Jennings Media — Storage buckets
--   deliveries   : private. Client media. Customers download through short-lived
--                  signed URLs minted by the server after an ownership check.
--   public-media : public. Portfolio, service imagery, hero video, avatars.
-- Uploads use signed upload URLs issued to admins by the server, so large files
-- go straight from the browser to Storage (never through a serverless function).
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('deliveries', 'deliveries', false, 5368709120),
  ('public-media', 'public-media', true, 524288000)
on conflict (id) do nothing;

create policy "Admins manage delivery files" on storage.objects
  for all to authenticated
  using (bucket_id = 'deliveries' and (select public.is_admin()))
  with check (bucket_id = 'deliveries' and (select public.is_admin()));

create policy "Admins manage public media" on storage.objects
  for all to authenticated
  using (bucket_id = 'public-media' and (select public.is_admin()))
  with check (bucket_id = 'public-media' and (select public.is_admin()));

create policy "Anyone can read public media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-media');
