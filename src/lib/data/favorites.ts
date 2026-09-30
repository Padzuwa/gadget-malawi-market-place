import { createClient } from '@/lib/supabase/server';
import type { Product, ProductCondition } from '@/lib/types';

type FavoriteRow = {
  product_id: string;
  created_at: string;
  products: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    price: number;
    currency: string;
    condition: ProductCondition;
    primary_image_url: string | null;
    image_urls: string[] | null;
    seller_id: string;
    categories: { name: string } | null;
    locations: { name: string } | null;
    profiles: {
      display_name: string | null;
      shop_name: string | null;
      shop_verified: boolean | null;
    } | null;
  } | null;
};

const SELECT_FAVORITES = `
  product_id,
  created_at,
  products:products(
    id,
    slug,
    title,
    subtitle,
    price,
    currency,
    condition,
    primary_image_url,
    image_urls,
    seller_id,
    categories:categories(name),
    locations:locations(name),
    profiles:profiles!products_seller_id_fkey(display_name, shop_name, shop_verified)
  )
`;
/**
 * Fetch every product the current user has favorited.
 * Returns an empty array if not signed in.
 */
export async function getMyFavorites(): Promise<Product[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('favorites')
    .select(SELECT_FAVORITES)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getMyFavorites error:', error.message);
    return [];
  }

  return (data as unknown as FavoriteRow[])
    .map((row) => {
      const p = row.products;
      if (!p) return null;

      const images = Array.isArray(p.image_urls) ? p.image_urls : [];
      const fallback = p.primary_image_url ?? '';
      const finalImages =
        images.length > 0 ? images : fallback ? [fallback] : [];

      const product: Product = {
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle ?? '',
        price: Number(p.price),
        currency: 'MWK',
        condition: p.condition,
        category: p.categories?.name ?? 'Uncategorised',
        location: p.locations?.name ?? 'Malawi',
        imageUrl: finalImages[0] ?? '',
        images: finalImages,
        sellerId: p.seller_id,
        seller: {
          name: p.profiles?.shop_name || p.profiles?.display_name || 'Seller',
          verified: Boolean(p.profiles?.shop_verified),
        },
      };
      return product;
    })
    .filter((p): p is Product => p !== null);
}

/**
 * Return the set of product IDs the current user has favorited.
 * Used to render correct heart state on product pages.
 */
export async function getMyFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data, error } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id);

  if (error || !data) {
    if (error) console.error('getMyFavoriteIds error:', error.message);
    return new Set();
  }

  return new Set(data.map((row) => row.product_id as string));
}

/**
 * Count of favorites for the current user.
 */
export async function getMyFavoriteCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from('favorites')
    .select('product_id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error('getMyFavoriteCount error:', error.message);
    return 0;
  }

  return count ?? 0;
}