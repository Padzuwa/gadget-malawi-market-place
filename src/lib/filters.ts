import type { Product, ProductCondition } from './types';

export type BrowseFilters = {
  category?: string;
  location?: string;
  condition?: ProductCondition[];
  min?: number;
  max?: number;
  q?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc';
};

export type RawSearchParams = {
  category?: string;
  location?: string;
  condition?: string;
  min?: string;
  max?: string;
  q?: string;
  sort?: string;
};

/**
 * Parse the raw URL search params into typed filters.
 * Unknown condition values are dropped silently.
 */
export function parseFilters(params: RawSearchParams): BrowseFilters {
  const conditions = (params.condition ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter((c): c is ProductCondition =>
      c === 'new' || c === 'like-new' || c === 'used'
    );

  const sort = params.sort;
  const validSort: BrowseFilters['sort'] =
    sort === 'price-asc' || sort === 'price-desc' || sort === 'newest'
      ? sort
      : 'newest';

  return {
    category: params.category || undefined,
    location: params.location || undefined,
    condition: conditions.length ? conditions : undefined,
    min: params.min ? Number(params.min) : undefined,
    max: params.max ? Number(params.max) : undefined,
    q: params.q?.trim() || undefined,
    sort: validSort,
  };
}

/**
 * Apply filters to a product list.
 * Kept pure so it can later be replaced by a Supabase query builder.
 */
export function filterProducts(
  products: Product[],
  filters: BrowseFilters
): Product[] {
  const {
    category,
    location,
    condition,
    min,
    max,
    q,
    sort = 'newest',
  } = filters;

  const needle = q?.toLowerCase();

  const filtered = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (location && product.location !== location) return false;
    if (condition && condition.length && !condition.includes(product.condition))
      return false;
    if (min !== undefined && product.price < min) return false;
    if (max !== undefined && product.price > max) return false;
    if (needle) {
      const haystack = `${product.title} ${product.subtitle}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }
  // 'newest' keeps original order — fine until we have real timestamps.

  return filtered;
}

/**
 * Count how many filters are active (for the "Clear all" affordance).
 */
export function countActiveFilters(filters: BrowseFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.location) count++;
  if (filters.condition?.length) count++;
  if (filters.min !== undefined) count++;
  if (filters.max !== undefined) count++;
  if (filters.q) count++;
  return count;
}