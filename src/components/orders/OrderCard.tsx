import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  STATUS_LABELS,
  STATUS_BADGE,
  type Order,
} from '@/lib/orders/types';

function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type Props = {
  order: Order;
  role: 'buyer' | 'seller';
};

export function OrderCard({ order, role }: Props) {
  const firstItem = order.items[0];
  const extra = order.items.length - 1;

  return (
    <Link href={`/orders/${order.id}`} className="gm-order-card">
      <div className="gm-order-card-thumb">
        {firstItem?.imageUrl ? (
          <img src={firstItem.imageUrl} alt={firstItem.title} loading="lazy" />
        ) : (
          <span className="gm-order-card-thumb-fallback">
            <FontAwesomeIcon icon={faImage} />
          </span>
        )}
      </div>

      <div className="gm-order-card-body">
        <div className="gm-order-card-head">
          <span className={`gm-badge ${STATUS_BADGE[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className="gm-xs gm-subtle">
            {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="gm-order-card-title">
          {firstItem?.title ?? 'Order'}
          {extra > 0 ? (
            <span className="gm-muted"> +{extra} more</span>
          ) : null}
        </div>

        <div className="gm-order-card-meta">
          {role === 'buyer' ? (
            <span className="gm-small gm-muted">
              From {order.sellerName}
            </span>
          ) : (
            <span className="gm-small gm-muted">
              To {order.buyerPhone}
            </span>
          )}
        </div>

        <div className="gm-order-card-total">
          <strong>
            {order.currency} {formatPrice(order.total)}
          </strong>
          <FontAwesomeIcon icon={faArrowRight} />
        </div>
      </div>
    </Link>
  );
}