import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="gm-card gm-card-pad" style={{ textAlign: 'center' }}>
        <p className="gm-muted">No products to show yet.</p>
      </div>
    );
  }

  return (
    <div className="gm-product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}