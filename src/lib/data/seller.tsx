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