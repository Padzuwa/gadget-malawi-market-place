'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartProvider';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  className?: string;
};

export function AddToCartButton({ product, className }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
      sellerId: product.sellerId,
      sellerName: product.seller.name,
      sellerVerified: product.seller.verified,
      location: product.location,
      condition: product.condition,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      className={className ?? 'gm-btn gm-btn-secondary'}
      onClick={handleAdd}
      aria-live="polite"
    >
      <FontAwesomeIcon icon={added ? faCheck : faCartShopping} />
      <span>{added ? 'Added to cart' : 'Add to cart'}</span>
    </button>
  );
}