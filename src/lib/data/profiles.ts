import { createClient } from '@/lib/supabase/server';
import type { Product, ProductCondition } from '@/lib/types';

/* ============================================================
   TYPES
   ============================================================ */

export type OwnProfile = {
  id: string;
  userType: 'individual' | 'shop';
  displayName: string;
  username: string | null;
  phone: string | null;
  locationId: string | null;
  locationName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  shopName: string | null;
  shopAddress: string | null;
  businessHours: string | null;
  shopPhotos: string[];
  shopVerified: boolean;
  verifiedAt: string | null;
  verificationSubmittedAt: string | null;
  usernameChangedAt: string | null;
  email: string | null;
  createdAt: string;
};

export type PublicProfile = {
  id: string;
  userType: 'individual' | 'shop';
  displayName: string;
  username: string | null;
  locationName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  shopName: string | null;
  shopAddress: string | null;
  businessHours: string | null;
  shopPhotos: string[];
  shopVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
};

/* ============================================================
   OWN PROFILE
   ============================================================ */

type OwnRow = {
  id: string;
  user_type: 'individual' | 'shop';
  display_name: string | null;
  username: string | null;
  phone: string | null;
  location_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  shop_name: string | null;
  shop_address: string | null;
  business_hours: string | null;
  shop_photos: string[] | null;
  shop_verified: boolean | null;
  verified_at: string | null;
  verification_submitted_at: string | null;
  username_changed_at: string | null;
  created_at: string;
  locations: { name: string } | null;
};

export async function getMyProfile(): Promise<OwnProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
        id,
        user_type,
        display_name,
        username,
        phone,
        location_id,
        avatar_url,
        bio,
        shop_name,
        shop_address,
        business_hours,
        shop_photos,
        shop_verified,
        verified_at,
        verification_submitted_at,
        username_changed_at,
        created_at,
        locations:locations(name)
      `
    )
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getMyProfile error:', error.message);
    return null;
  }

  const row = data as unknown as OwnRow;
  const location = Array.isArray(row.locations)
    ? row.locations[0]
    : row.locations;

  return {
    id: row.id,
    userType: row.user_type,
    displayName: row.display_name ?? '',
    username: row.username,
    phone: row.phone,
    locationId: row.location_id,
    locationName: location?.name ?? null,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    shopName: row.shop_name,
    shopAddress: row.shop_address,
    businessHours: row.business_hours,
    shopPhotos: Array.isArray(row.shop_photos) ? row.shop_photos : [],
    shopVerified: Boolean(row.shop_verified),
    verifiedAt: row.verified_at,
    verificationSubmittedAt: row.verification_submitted_at,
    usernameChangedAt: row.username_changed_at,
    email: user.email ?? null,
    createdAt: row.created_at,
  };
}

/* ============================================================
   PUBLIC PROFILE
   ============================================================ */

type PublicRow = {
  id: string;
  user_type: 'individual' | 'shop';
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  shop_name: string | null;
  shop_address: string | null;
  business_hours: string | null;
  shop_photos: string[] | null;
  shop_verified: boolean | null;
  verified_at: string | null;
  created_at: string;
  locations: { name: string } | null;
};

export async function getProfileByUsername(
  username: string
): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
        id,
        user_type,
        display_name,
        username,
        avatar_url,
        bio,
        shop_name,
        shop_address,
        business_hours,
        shop_photos,
        shop_verified,
        verified_at,
        created_at,
        locations:locations(name)
      `
    )
    .eq('username', username.toLowerCase())
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getProfileByUsername error:', error.message);
    return null;
  }

  const row = data as unknown as PublicRow;
  const location = Array.isArray(row.locations)
    ? row.locations[0]
    : row.locations;

  return {
    id: row.id,
    userType: row.user_type,
    displayName: row.display_name ?? '',
    username: row.username,
    locationName: location?.name ?? null,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    shopName: row.shop_name,
    shopAddress: row.shop_address,
    businessHours: row.business_hours,
    shopPhotos: Array.isArray(row.shop_photos) ? row.shop_photos : [],
    shopVerified: Boolean(row.shop_verified),
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  };
}

/* ============================================================
   PUBLIC LISTINGS
   ============================================================ */

type ListingRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  primary_image_url: string | null;
  image_urls: string[] | null;
  categories: { name: string } | null;
  locations: { name: string } | null;
};

export async function getPublicListings(
  sellerId: string
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(
      `
        id,
        slug,
        title,
        subtitle,
        price,
        currency,
        condition,
        primary_image_url,
        image_urls,
        categories!inner(name),
        locations!inner(name)
      `
    )
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(48);

  if (error || !data) {
    if (error) console.error('getPublicListings error:', error.message);
    return [];
  }

  return (data as unknown as ListingRow[]).map((row) => {
    const images = Array.isArray(row.image_urls) ? row.image_urls : [];
    const fallback = row.primary_image_url ?? '';
    const finalImages =
      images.length > 0 ? images : fallback ? [fallback] : [];

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle ?? '',
      price: Number(row.price),
      currency: 'MWK',
      condition: row.condition,
      category: row.categories?.name ?? 'Uncategorised',
      location: row.locations?.name ?? 'Malawi',
      imageUrl: finalImages[0] ?? '',
      images: finalImages,
      sellerId,
      seller: { name: '', verified: false },
    };
  });
}