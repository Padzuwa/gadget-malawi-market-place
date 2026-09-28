'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faMinus,
  faPlus,
  faLocationDot,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartProvider';
import type { CartItem } from '@/lib/cart/types';

function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const conditionLabels: Record<CartItem['condition'], string> = {
  new: 'New',
  'like-new': 'Like new',
  used: 'Used',
};

const conditionClasses: Record<CartItem['condition'], string> = {
  new: 'gm-badge-new',
  'like-new': 'gm-badge-new',
  used: 'gm-badge-used',
};

export function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();
  const lineTotal = item.price * item.quantity;

  return (
    <article className="gm-cart-row">
      <Link
        href={`/product/${item.slug}`}
        className="gm-cart-thumb"
        aria-label={item.title}
      >
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} loading="lazy" />
        ) : (
          <span className="gm-cart-thumb-fallback" />
        )}
      </Link>

      <div className="gm-cart-body">
        <div className="gm-cart-head">
          <div className="gm-cart-titles">
            <Link href={`/product/${item.slug}`} className="gm-cart-title">
              {item.title}
            </Link>
            {item.subtitle ? (
              <span className="gm-cart-subtitle">{item.subtitle}</span>
            ) : null}
          </div>

          <button
            type="button"
            className="gm-icon-btn gm-cart-remove"
            onClick={() => removeItem(item.productId)}
            aria-label="Remove from cart"
            title="Remove"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>

        <div className="gm-cart-meta">
          <span className={`gm-badge ${conditionClasses[item.condition]}`}>
            {conditionLabels[item.condition]}
          </span>
          {item.sellerVerified ? (
            <span className="gm-badge gm-badge-verified">
              <FontAwesomeIcon icon={faCircleCheck} />
              {item.sellerName}
            </span>
          ) : (
            <span className="gm-small gm-muted">{item.sellerName}</span>
          )}
          <span className="gm-product-location gm-small gm-muted">
            <FontAwesomeIcon icon={faLocationDot} />
            {item.location}
          </span>
        </div>

        <div className="gm-cart-bottom">
          <div className="gm-cart-qty" role="group" aria-label="Quantity">
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.productId, item.quantity - 1)
              }
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <span className="gm-cart-qty-value">{item.quantity}</span>
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.productId, item.quantity + 1)
              }
              aria-label="Increase quantity"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="gm-cart-prices">
            <span className="gm-small gm-muted">
              {item.currency} {formatPrice(item.price)} each
            </span>
            <strong className="gm-cart-line-total">
              {item.currency} {formatPrice(lineTotal)}
            </strong>
          </div>
        </div>
      </div>
    </article>
  );
}