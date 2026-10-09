/**
 * Compress and upload a shop photo.
 * Photos are stored under the user's folder: {user_id}/shop/{uuid}.webp
 * No overwrite — each upload creates a new file.
 *
 * Uses the same `avatars` bucket; the RLS policy already permits
 * writes to any path under `{user_id}/`.
 */
export async function uploadShopPhoto(file: File): Promise<{
  path: string;
  url: string;
}> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to upload photos.');
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });

  const id = crypto.randomUUID().slice(0, 12);
  const path = `${user.id}/shop/${id}.webp`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, compressed, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year — shop photos rarely change
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  return { path, url: data.publicUrl };
}

/**
 * Delete a shop photo from storage.
 * Best-effort — failures are silent so the UI can proceed with removal.
 */
export async function deleteShopPhoto(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from('avatars').remove([path]);
}