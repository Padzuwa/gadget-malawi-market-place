import { createClient } from '@/lib/supabase/server';
import type { Product, ProductCondition } from '@/lib/types';
import type { BrowseFilters } from '@/lib/filters';

/**
 * Raw shape returned by Supabase when we join categories, locations,
 * and the seller profile onto the products row.
 */
type ProductRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  currency: string;
  condition: ProductCondition;
  primary_image_url: string | null;
  created_at: string;
  categories: { name: string } | null;
  locations: { name: string } | null;
  profiles: {
    display_name: string | null;
    shop_name: string | null;
    shop_verified: boolean | null;
  } | null;
};

const SELECT_COLUMNS = `
  id,
  slug,
  title,
  subtitle,
  price,
  currency,
  condition,
  primary_image_url,
  created_at,
  categories:categories(name),
  locations:locations(name),
  profiles:profiles(display_name, shop_name, shop_verified)
`;

function mapRow(row: ProductRow): Product {
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
    imageUrl: row.primary_image_url ?? '',
    seller: {
      name: row.profiles?.shop_name || row.profiles?.display_name || 'Seller',
      verified: Boolean(row.profiles?.shop_verified),
    },
  };
}

/** Fetch a list of products with optional filters. */
export async function getProducts(
  filters: BrowseFilters = {}
): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('status', 'active');

  if (filters.category) {
    // Filter through the joined categories table by name.
    // (PostgREST supports filtering on embedded resources.)
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

/** Fetch a single product by slug. Returns null if not found. */
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

/** Fetch similar products — same category, excluding one id. */
export async function getSimilarProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const supabase = await createClient();

  // Same category first
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

  // Fill the gap with recent items from other categories
  const { data: others } = await supabase
    .from('products')
    .select(SELECT_COLUMNS)
    .eq('status', 'active')
    .neq('id', product.id)
    .neq('categories.name', product.category)
    .order('created_at', { ascending: false })
    .limit(limit - same.length);

  const rest = (others as unknown as ProductRow[] | null) ?? [];

  return [...same, ...rest].map(mapRow);
}