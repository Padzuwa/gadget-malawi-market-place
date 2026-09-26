import Link from 'next/link';
import { HomeHero } from '@/components/home/HomeHero';
import { ProductGrid } from '@/components/home/ProductGrid';
import { getProducts } from '@/lib/data/products';

export default async function HomePage() {
  const products = await getProducts({ sort: 'newest' });
  const featured = products.slice(0, 8);

  return (
    <div className="gm-stack" style={{ gap: 32 }}>
      <HomeHero />

      <section>
        <div className="gm-between" style={{ marginBottom: 18 }}>
          <div>
            <span className="gm-eyebrow">Featured</span>
            <h2 className="gm-section-title" style={{ marginTop: 6 }}>
              Fresh gadgets on the market
            </h2>
          </div>
          <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-sm">
            View all
          </Link>
        </div>

        <ProductGrid products={featured} />
      </section>
    </div>
  );
}