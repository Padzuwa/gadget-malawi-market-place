'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartProvider';

function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function CartSummary() {
  const { items, subtotal, count } = useCart();

  const sellerCount = new Set(items.map((i) => i.sellerId)).size;

  return (
    <aside className="gm-card gm-card-pad gm-cart-summary">
      <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
        Order summary
      </h2>

      <div className="gm-cart-summary-lines">
        <div className="gm-cart-summary-line">
          <span>Subtotal ({count} item{count === 1 ? '' : 's'})</span>
          <span>MWK {formatPrice(subtotal)}</span>
        </div>

        <div className="gm-cart-summary-line">
          <span>Delivery</span>
          <span className="gm-muted">Calculated at checkout</span>
        </div>

        {sellerCount > 1 ? (
          <div className="gm-cart-summary-line">
            <span className="gm-muted">Sellers</span>
            <span className="gm-muted">{sellerCount}</span>
          </div>
        ) : null}
      </div>

      <div className="gm-cart-summary-total">
        <span>Total</span>
        <strong>MWK {formatPrice(subtotal)}</strong>
      </div>

      <p className="gm-small gm-muted gm-cart-summary-note">
        <FontAwesomeIcon icon={faShieldHalved} />
        You&apos;ll pay with Airtel Money or TNM Mpamba at checkout. Funds
        are only released to sellers when you confirm delivery.
      </p>

      <Link
        href="/checkout"
        className="gm-btn gm-btn-primary gm-btn-block gm-cart-checkout"
      >
        Proceed to checkout
        <FontAwesomeIcon icon={faArrowRight} />
      </Link>

      <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-block">
        Continue shopping
      </Link>
    </aside>
  );
}