import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

type SimilarProductsProps = {
  products: Product[];
  currentProduct: Product;
};

export function SimilarProducts({
  products,
  currentProduct,
}: SimilarProductsProps) {
  if (products.length === 0) return null;

  return (
    <section style={{ marginTop: 40 }}>
      <div className="gm-between" style={{ marginBottom: 18 }}>
        <div>
          <span className="gm-eyebrow">You might also like</span>
          <h2 className="gm-section-title" style={{ marginTop: 6 }}>
            Similar gadgets
          </h2>
        </div>
        <Link
          href={`/browse?category=${encodeURIComponent(currentProduct.category)}`}
          className="gm-btn gm-btn-ghost gm-btn-sm"
        >
          See all {currentProduct.category}
        </Link>
      </div>

      <div className="gm-product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}