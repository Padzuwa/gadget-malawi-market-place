'use client';

import { useCart } from './CartProvider';

export function CartBadge() {
  const { count, hydrated } = useCart();

  // Render nothing until we've read localStorage — avoids hydration mismatch
  if (!hydrated || count <= 0) return null;

  return (
    <span className="gm-nav-badge" aria-label={`${count} items in cart`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}