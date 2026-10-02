'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faTruck,
  faSpinner,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { placeOrder } from '@/app/checkout/actions';
import { useCart } from '@/components/cart/CartProvider';
import type { DeliveryMethod } from '@/lib/orders/types';

type Props = {
  defaultPhone: string;
  defaultAddress: string;
};

function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function CheckoutForm({ defaultPhone, defaultAddress }: Props) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [pending, startTransition] = useTransition();

  const [phone, setPhone] = useState(defaultPhone);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [address, setAddress] = useState(defaultAddress);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sellerCount = new Set(items.map((i) => i.sellerId)).size;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        buyerPhone: phone,
        buyerNote: note || undefined,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === 'delivery' ? address : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clear();
      router.push(`/orders/${result.firstOrderId}?placed=1`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="gm-stack" style={{ gap: 20 }}>
      {/* Delivery method */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
          How would you like to receive your items?
        </h2>

        <div className="gm-delivery-options">
          <label
            className={`gm-delivery-option${deliveryMethod === 'pickup' ? ' is-selected' : ''}`}
          >
            <input
              type="radio"
              name="delivery"
              value="pickup"
              checked={deliveryMethod === 'pickup'}
              onChange={() => setDeliveryMethod('pickup')}
            />
            <span className="gm-delivery-icon">
              <FontAwesomeIcon icon={faStore} />
            </span>
            <span className="gm-delivery-body">
              <strong>Pickup / meet seller</strong>
              <span>You and the seller agree on a place to meet.</span>
            </span>
          </label>

          <label
            className={`gm-delivery-option${deliveryMethod === 'delivery' ? ' is-selected' : ''}`}
          >
            <input
              type="radio"
              name="delivery"
              value="delivery"
              checked={deliveryMethod === 'delivery'}
              onChange={() => setDeliveryMethod('delivery')}
            />
            <span className="gm-delivery-icon">
              <FontAwesomeIcon icon={faTruck} />
            </span>
            <span className="gm-delivery-body">
              <strong>Delivery</strong>
              <span>The seller delivers to your address.</span>
            </span>
          </label>
        </div>
      </section>

      {/* Contact */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
          Contact details
        </h2>

        <div className="gm-field">
          <label className="gm-label" htmlFor="phone">
            Phone number *
          </label>
          <input
            id="phone"
            type="tel"
            className="gm-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+265 9XX XXX XXX"
            required
            autoComplete="tel"
            inputMode="tel"
          />
          <span className="gm-xs gm-subtle">
            Sellers will use this to coordinate delivery or pickup.
          </span>
        </div>

        {deliveryMethod === 'delivery' ? (
          <div className="gm-field">
            <label className="gm-label" htmlFor="address">
              Delivery address *
            </label>
            <textarea
              id="address"
              className="gm-textarea"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Area, street, landmark — anything that helps the seller find you."
              required
              rows={3}
              maxLength={300}
            />
          </div>
        ) : null}

        <div className="gm-field">
          <label className="gm-label" htmlFor="note">
            Note to seller <span className="gm-muted">(optional)</span>
          </label>
          <textarea
            id="note"
            className="gm-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any specific instructions?"
            rows={2}
            maxLength={500}
          />
        </div>
      </section>

      {/* Summary */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 12 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
          Order summary
        </h2>

        <div className="gm-checkout-lines">
          {items.map((i) => (
            <div key={i.productId} className="gm-checkout-line">
              <span className="gm-checkout-line-qty">×{i.quantity}</span>
              <span className="gm-checkout-line-title">{i.title}</span>
              <span className="gm-checkout-line-total">
                MWK {formatPrice(i.price * i.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="gm-checkout-totals">
          <div>
            <span>Subtotal</span>
            <span>MWK {formatPrice(subtotal)}</span>
          </div>
          {sellerCount > 1 ? (
            <div className="gm-muted gm-small">
              <span>Split into</span>
              <span>
                {sellerCount} orders from {sellerCount} sellers
              </span>
            </div>
          ) : null}
          <div className="gm-checkout-grand">
            <span>Total</span>
            <strong>MWK {formatPrice(subtotal)}</strong>
          </div>
        </div>
      </section>

      {error ? (
        <p
          className="gm-small"
          style={{ color: 'var(--gm-danger)', margin: 0 }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="gm-checkout-submit">
        <p className="gm-small gm-muted" style={{ margin: 0 }}>
          <FontAwesomeIcon icon={faShieldHalved} />
          Placing an order doesn&apos;t charge you. Payment comes next.
        </p>

        <button
          type="submit"
          className="gm-btn gm-btn-primary gm-btn-block"
          disabled={pending || items.length === 0}
        >
          {pending ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Placing order…
            </>
          ) : (
            'Place order'
          )}
        </button>
      </div>
    </form>
  );
}