import { createClient } from '@/lib/supabase/server';
import type { ProductCondition, ProductStatus } from '@/lib/types';

export type SellerListing = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  primaryImageUrl: string | null;
  viewsCount: number;
  createdAt: string;
  categoryName: string | null;
  locationName: string | null;
};

export type SellerStats = {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
};

type ListingRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  status: ProductStatus;
  primary_image_url: string | null;
  views_count: number;
  created_at: string;
  categories: { name: string } | null;
  locations: { name: string } | null;
};

const LISTING_SELECT = `
  id,
  slug,
  title,
  price,
  currency,
  condition,
  status,
  primary_image_url,
  views_count,
  created_at,
  categories:categories(name),
  locations:locations(name)
`;

export async function getMyListings(): Promise<SellerListing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('products')
    .select(LISTING_SELECT)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getMyListings error:', error.message);
    return [];
  }

  return (data as unknown as ListingRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    status: row.status,
    primaryImageUrl: row.primary_image_url,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    categoryName: row.categories?.name ?? null,
    locationName: row.locations?.name ?? null,
  }));
}

export function computeStats(listings: SellerListing[]): SellerStats {
  // Archived listings don't count toward "total" — they're effectively deleted
  const visible = listings.filter((l) => l.status !== 'archived');

  return {
    totalListings: visible.length,
    activeListings: visible.filter((l) => l.status === 'active').length,
    soldListings: visible.filter((l) => l.status === 'sold').length,
    totalViews: visible.reduce((sum, l) => sum + (l.viewsCount || 0), 0),
  };
  
}
export type EditableListing = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  locationId: string;
  condition: ProductCondition;
  price: number;
  specs: Record<string, string>;
  images: { path: string; url: string }[];
};

type EditableRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category_id: string | null;
  location_id: string | null;
  condition: ProductCondition;
  price: number;
  specs: Record<string, string> | null;
  image_urls: string[] | null;
};

/**
 * Extract the storage path from a Supabase public URL.
 * e.g. ".../product-images/user-id/photo.webp" -> "user-id/photo.webp"
 * Returns '' if the URL isn't a product image.
 */
function pathFromPublicUrl(url: string): string {
  const marker = '/storage/v1/object/public/product-images/';
  const idx = url.indexOf(marker);
  return idx === -1 ? '' : url.slice(idx + marker.length);
}

export async function getMyListingById(
  id: string
): Promise<EditableListing | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, title, subtitle, description, category_id, location_id, condition, price, specs, image_urls'
    )
    .eq('id', id)
    .eq('seller_id', user.id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getMyListingById error:', error.message);
    return null;
  }

  const row = data as EditableRow;

  const imageUrls = Array.isArray(row.image_urls) ? row.image_urls : [];
  const images = imageUrls.map((url) => ({
    url,
    path: pathFromPublicUrl(url),
  }));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    categoryId: row.category_id ?? '',
    locationId: row.location_id ?? '',
    condition: row.condition,
    price: Number(row.price),
    specs: (row.specs as Record<string, string>) ?? {},
    images,
  };
}