'use client';
// This file contains client-side components for order actions, such as marking an order as delivered or shipped.
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faTruck,
  faXmark,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import {
  markDelivered,
  markShipped,
  cancelOrder,
} from '@/app/orders/actions';
import type { Order } from '@/lib/orders/types';

type Props = {
  order: Order;
  role: 'buyer' | 'seller';
};

export function OrderActions({ order, role }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(
    fn: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>
  ) {
    setError(null);
    startTransition(async () => {
      const result = await fn(order.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  }

  const canBuyerConfirm =
    role === 'buyer' && ['paid', 'shipped'].includes(order.status);
  const canSellerShip = role === 'seller' && order.status === 'paid';
  const canCancel = order.status === 'pending';

  if (!canBuyerConfirm && !canSellerShip && !canCancel) return null;

  return (
    <section className="gm-card gm-card-pad gm-stack" style={{ gap: 10 }}>
      <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
        Actions
      </h2>

      {canSellerShip ? (
        <button
          type="button"
          className="gm-btn gm-btn-primary gm-btn-block"
          onClick={() => run(markShipped)}
          disabled={pending}
        >
          <FontAwesomeIcon icon={pending ? faSpinner : faTruck} spin={pending} />
          Mark as shipped
        </button>
      ) : null}

      {canBuyerConfirm ? (
        <button
          type="button"
          className="gm-btn gm-btn-primary gm-btn-block"
          onClick={() => run(markDelivered)}
          disabled={pending}
        >
          <FontAwesomeIcon
            icon={pending ? faSpinner : faCircleCheck}
            spin={pending}
          />
          I received this item
        </button>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          className="gm-btn gm-btn-secondary gm-btn-block"
          onClick={() => run(cancelOrder)}
          disabled={pending}
        >
          <FontAwesomeIcon icon={faXmark} />
          Cancel order
        </button>
      ) : null}

      {error ? (
        <p
          className="gm-small"
          style={{ color: 'var(--gm-danger)', margin: 0 }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}