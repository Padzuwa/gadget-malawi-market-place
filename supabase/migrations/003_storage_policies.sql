-- ============================================================
-- Gadget Malawi — Storage policies for product-images bucket
-- ============================================================

-- Public read (anyone can view product images)
drop policy if exists "Product images are publicly readable"
  on storage.objects;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Authenticated users can upload to their own folder: {user_id}/...
drop policy if exists "Users can upload own product images"
  on storage.objects;

create policy "Users can upload own product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own uploads
drop policy if exists "Users can update own product images"
  on storage.objects;

create policy "Users can update own product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own uploads
drop policy if exists "Users can delete own product images"
  on storage.objects;

create policy "Users can delete own product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );