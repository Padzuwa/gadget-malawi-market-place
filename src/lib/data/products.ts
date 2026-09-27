import { createClient } from '@/lib/supabase/server';
import type { Product, ProductCondition } from '@/lib/types';
import type { BrowseFilters } from '@/lib/filters';

type ProductRow = {
  id: string;
  seller_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  primary_image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  categories: { name: string } | null;
  locations: { name: string } | null;
  profiles: {
    display_name: string | null;
    shop_name: string | null;
    shop_verified: boolean | null;
  } | null;
};

/**
 * The `!inner` on categories and locations turns those joins into filters.
 * Without it, .eq('categories.name', ...) would only filter the joined rows,
 * not the parent products — which is why filters silently did nothing before.
 */
const SELECT_COLUMNS = `
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
  created_at,
  categories!inner(name),
  locations!inner(name),
  profiles:profiles(display_name, shop_name, shop_verified)
`;

function mapRow(row: ProductRow): Product {
  const images = Array.isArray(row.image_urls) ? row.image_urls : [];
  const fallback = row.primary_image_url ?? '';
  const finalImages = images.length > 0 ? images : fallback ? [fallback] : [];

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
    sellerId: row.seller_id,
    seller: {
      name: row.profiles?.shop_name || row.profiles?.display_name || 'Seller',
      verified: Boolean(row.profiles?.shop_verified),
    },
  };
}

export async function getProducts(
  filters: BrowseFilters = {}
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('status', 'active');

  if (filters.category) {
    query = query.eq('categories.name', filters.category);
  }

  if (filters.location) {
    query = query.eq('locations.name', filters.location);
  }

  if (filters.condition?.length) {
    query = query.in('condition', filters.condition);
  }

  if (filters.min !== undefined) {
    query = query.gte('price', filters.min);
  }

  if (filters.max !== undefined) {
    query = query.lte('price', filters.max);
  }

  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,subtitle.ilike.%${filters.q}%`
    );
  }

  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('getProducts error:', error.message);
    return [];
  }

  return (data as unknown as ProductRow[]).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getProductBySlug error:', error.message);
    return null;
  }

  return mapRow(data as unknown as ProductRow);
}

export async function getSimilarProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  const { data: sameCategory } = await supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('status', 'active')
    .eq('categories.name', product.category)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  const same = (sameCategory as unknown as ProductRow[] | null) ?? [];

  if (same.length >= limit) {
    return same.map(mapRow);
  }

  const { data: others } = await supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('status', 'active')
    .neq('categories.name', product.category)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(limit - same.length);

  const rest = (others as unknown as ProductRow[] | null) ?? [];

  return [...same, ...rest].map(mapRow);
}