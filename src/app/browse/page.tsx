import type { Metadata } from 'next';
import { FilterPanel } from '@/components/browse/FilterPanel';
import { BrowseToolbar } from '@/components/browse/BrowseToolbar';
import { ProductGrid } from '@/components/home/ProductGrid';
import { getProducts } from '@/lib/data/products';
import { getCategories, getLocations } from '@/lib/data/taxonomy';
import { parseFilters } from '@/lib/filters';

export const metadata: Metadata = {
  title: 'Browse gadgets',
  description:
    'Filter gadgets and PC parts by category, brand, location, condition, and price. Buy from verified sellers across Malawi.',
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function asString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const raw = await searchParams;

  const filters = parseFilters({
    category: asString(raw.category),
    location: asString(raw.location),
    condition: asString(raw.condition),
    min: asString(raw.min),
    max: asString(raw.max),
    q: asString(raw.q),
    sort: asString(raw.sort),
  });

  const [products, categories, locations] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getLocations(),
  ]);

  return (
    <div className="gm-stack" style={{ gap: 24 }}>
      <div>
        <span className="gm-eyebrow">Marketplace</span>
        <h1 className="gm-title" style={{ marginTop: 6 }}>
          Browse gadgets
        </h1>
        <p className="gm-muted" style={{ marginTop: 8, maxWidth: 620 }}>
          Filter by category, location, condition, and price. Every listing is
          tied to a real seller — verified shops get a blue badge.
        </p>
      </div>

      <div className="gm-filter-layout">
        <FilterPanel categories={categories} locations={locations} />

        <div className="gm-stack" style={{ gap: 18 }}>
          <BrowseToolbar resultCount={products.length} />
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}