'use client';

import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartProvider';
import type { Product } from '@/lib/types';

type Props = {
  product: Product;
  className?: string;
};

export function BuyNowButton({ product, className }: Props) {
  const router = useRouter();
  const { items, addItem } = useCart();

  function handleClick() {
    // Only add if not already in cart — avoids silently bumping quantity
    const alreadyInCart = items.some((i) => i.productId === product.id);

    if (!alreadyInCart) {
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
    }

    router.push('/checkout');
  }

  return (
    <button
      type="button"
      className={className ?? 'gm-btn gm-btn-primary gm-btn-buy'}
      onClick={handleClick}
    >
      <FontAwesomeIcon icon={faTag} />
      <span>Buy now</span>
    </button>
  );
}