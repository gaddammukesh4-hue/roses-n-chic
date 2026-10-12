-- Roses N Chic: RLS for the product-media Storage bucket. The bucket
-- itself is created as public (not via migration -- Storage buckets aren't
-- schema, they're created through the Storage API/dashboard; this project
-- created it via the Management API, see supabase/README.md).
--
-- Public GET on a public bucket's files bypasses RLS entirely (Supabase
-- serves public-bucket objects directly), so this SELECT policy only
-- governs the list/metadata API methods, not the actual image URLs the
-- storefront uses. Write access is admin-only, matching every other
-- write-restricted table in this schema -- manual uploads through the
-- Supabase dashboard use the project owner's privileged session and are
-- unaffected by this either way; this is defense in depth for if/when an
-- admin UI uses the regular client instead.

create policy "product_media_storage_select" on storage.objects
  for select using (bucket_id = 'product-media');

create policy "product_media_storage_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_admin());

create policy "product_media_storage_admin_update" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_admin());

create policy "product_media_storage_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-media' and public.is_admin());
