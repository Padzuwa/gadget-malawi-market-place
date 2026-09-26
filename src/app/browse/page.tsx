import type { Metadata } from 'next';
import { ProductGrid } from '@/components/home/ProductGrid';
import { getProducts } from '@/lib/data/products';
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

  const products = await getProducts(filters);

  return (
    <div className="gm-stack" style={{ gap: 22 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="gm-eyebrow">Marketplace</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            Browse gadgets
          </h1>
        </div>
        <span className="gm-small gm-muted">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}