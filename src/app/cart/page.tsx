'use client';
// This is the main cart page, which displays the list of items in the cart and a summary of the total cost. It uses the CartProvider context to access the cart state and actions. The page handles three states: loading (hydration), empty cart, and populated cart. It also provides buttons to clear the cart or continue shopping.
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCartShopping,
  faTrash,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '@/components/cart/CartProvider';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
  const { items, hydrated, clear } = useCart();

  // Server and initial client render both show skeleton — avoids hydration mismatch
  if (!hydrated) {
    return (
      <div className="gm-stack" style={{ gap: 24 }}>
        <div className="gm-skeleton" style={{ height: 40, maxWidth: 240 }} />
        <div className="gm-cart-layout">
          <div className="gm-skeleton" style={{ height: 300 }} />
          <div className="gm-skeleton" style={{ height: 300 }} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="gm-cart-empty">
        <FontAwesomeIcon icon={faCartShopping} />
        <h1 className="gm-title" style={{ margin: 0 }}>
          Your cart is empty
        </h1>
        <p className="gm-muted" style={{ margin: 0, maxWidth: 360, textAlign: 'center' }}>
          Browse gadgets and tap <strong>Add to cart</strong> to save them here
          for later.
        </p>
        <Link href="/browse" className="gm-btn gm-btn-primary">
          Browse gadgets
        </Link>
      </div>
    );
  }

  return (
    <div className="gm-stack" style={{ gap: 24 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div>
          <span className="gm-eyebrow">Your cart</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            {items.length} item{items.length === 1 ? '' : 's'}
          </h1>
        </div>

        <div className="gm-row" style={{ gap: 8 }}>
          <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-sm">
            <FontAwesomeIcon icon={faArrowLeft} />
            Keep shopping
          </Link>
          <button
            type="button"
            className="gm-btn gm-btn-ghost gm-btn-sm"
            onClick={clear}
            aria-label="Clear cart"
          >
            <FontAwesomeIcon icon={faTrash} />
            Clear
          </button>
        </div>
      </div>

      <div className="gm-cart-layout">
        <div className="gm-stack" style={{ gap: 12 }}>
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>

        <CartSummary />
      </div>
    </div>
  );
}