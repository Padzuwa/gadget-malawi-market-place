import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

export type UploadedImage = {
  path: string;
  url: string;
};

const MAX_DIMENSION = 1600; // px — plenty for a marketplace card
const MAX_SIZE_MB = 0.4;    // compress to under ~400KB
const BUCKET = 'product-images';

function buildFileName(originalName: string): string {
  const base = originalName
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'image';
  const unique = crypto.randomUUID().slice(0, 8);
  return `${base}-${unique}.webp`;
}

/**
 * Compresses a File in the browser, then uploads it to Supabase Storage
 * under the current user's folder.
 *
 * Throws if:
 *  - user is not authenticated
 *  - file type is not an image
 *  - upload fails
 */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to upload images.');
  }

  // Compress in a web worker. Converts to WebP for smaller sizes.
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });

  const fileName = buildFileName(file.name);
  const path = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      contentType: 'image/webp',
      cacheControl: '31536000', // 1 year — matches our cache header policy
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, url: data.publicUrl };
}

/**
 * Best-effort delete. Used when a seller removes an image before saving.
 */
export async function deleteProductImage(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}