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
const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_DIMENSION = 400;
const AVATAR_MAX_SIZE_MB = 0.15;

/**
 * Compress and upload a user avatar. Overwrites the previous avatar.
 * Returns the public URL with a cache-busting query string so clients
 * always fetch the newest version.
 */
export async function uploadAvatar(file: File): Promise<{
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
    throw new Error('You must be signed in to upload an avatar.');
  }

  // Square-crop is not done here — the browser-side compression keeps
  // the aspect ratio, and the UI renders inside a circle with object-fit.
  const compressed = await imageCompression(file, {
    maxSizeMB: AVATAR_MAX_SIZE_MB,
    maxWidthOrHeight: AVATAR_MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.9,
  });

  const path = `${user.id}/avatar.webp`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, compressed, {
      contentType: 'image/webp',
      cacheControl: '3600', // 1 hour — shorter than product images since
                            // avatars change more often
      upsert: true,          // overwrite previous avatar
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  // Cache-bust: append the current timestamp so the browser refetches
  const bustedUrl = `${data.publicUrl}?v=${Date.now()}`;

  return { path, url: bustedUrl };
}
/* ============================================================
   SHOP PHOTOS
   ============================================================ */

const SHOP_PHOTOS_BUCKET = 'shop-photos';
const SHOP_PHOTO_MAX_DIMENSION = 1200;
const SHOP_PHOTO_MAX_SIZE_MB = 0.3;

/**
 * Compress and upload a shop photo.
 * Stored under the user's folder: {user_id}/{uuid}.webp
 * Each upload creates a new file — no overwrite.
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
    maxSizeMB: SHOP_PHOTO_MAX_SIZE_MB,
    maxWidthOrHeight: SHOP_PHOTO_MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.85,
  });

  const id = crypto.randomUUID().slice(0, 12);
  const path = `${user.id}/${id}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(SHOP_PHOTOS_BUCKET)
    .upload(path, compressed, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(SHOP_PHOTOS_BUCKET)
    .getPublicUrl(path);

  return { path, url: data.publicUrl };
}

/**
 * Delete a shop photo. Best-effort — errors are silent so the UI proceeds.
 */
export async function deleteShopPhoto(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(SHOP_PHOTOS_BUCKET).remove([path]);
}