import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faStore,
  faTruck,
  faLocationDot,
  faPhone,
  faImage,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/data/orders';
import { OrderActions } from '@/components/orders/OrderActions';
import {
  STATUS_LABELS,
  STATUS_BADGE,
  type Order,
} from '@/lib/orders/types';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await getOrderById(id);
  return {
    title: order ? `Order #${order.id.slice(0, 8)}` : 'Order',
  };
}

function formatPrice(amount: number): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { placed } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/orders/${id}`);

  const order = await getOrderById(id);
  if (!order) notFound();

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  if (!isBuyer && !isSeller) notFound();

  const justPlaced = placed === '1';

  return (
    <div className="gm-stack" style={{ gap: 24, maxWidth: 780 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <Link
          href={isBuyer ? '/orders' : '/dashboard/orders'}
          className="gm-btn gm-btn-ghost gm-btn-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to orders
        </Link>
      </div>

      {justPlaced ? (
        <div className="gm-order-placed-banner">
          <div className="gm-order-placed-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div>
            <strong>Order placed</strong>
            <span>
              Your order is pending. Payment with Airtel Money or TNM Mpamba
              is coming next.
            </span>
          </div>
        </div>
      ) : null}

      <div>
        <span className="gm-eyebrow">
          Order #{order.id.slice(0, 8)}
        </span>
        <h1 className="gm-title" style={{ marginTop: 6 }}>
          {STATUS_LABELS[order.status]}
        </h1>
        <p className="gm-muted" style={{ marginTop: 6 }}>
          Placed {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="gm-order-status-row">
        <span className={`gm-badge ${STATUS_BADGE[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
        <span className="gm-small gm-muted">
          <FontAwesomeIcon icon={faStore} />{' '}
          {isBuyer ? `From ${order.sellerName}` : `Buyer: ${order.buyerPhone}`}
          {order.sellerVerified && isBuyer ? (
            <FontAwesomeIcon
              icon={faCircleCheck}
              style={{ marginLeft: 6, color: 'var(--gm-info)' }}
            />
          ) : null}
        </span>
      </div>

      {/* Items */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 12 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
          Items
        </h2>

        <div className="gm-stack" style={{ gap: 10 }}>
          {order.items.map((item) => (
            <div key={item.id} className="gm-order-item">
              <div className="gm-order-item-thumb">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <FontAwesomeIcon icon={faImage} />
                )}
              </div>
              <div className="gm-order-item-body">
                <strong className="gm-order-item-title">{item.title}</strong>
                {item.subtitle ? (
                  <span className="gm-small gm-muted">{item.subtitle}</span>
                ) : null}
                <span className="gm-small gm-muted">
                  × {item.quantity} · MWK {formatPrice(item.price)} each
                </span>
              </div>
              <strong className="gm-order-item-total">
                MWK {formatPrice(item.lineTotal)}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 12 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
          {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
        </h2>

        <div className="gm-row" style={{ gap: 10 }}>
          <FontAwesomeIcon
            icon={order.deliveryMethod === 'delivery' ? faTruck : faStore}
            style={{ color: 'var(--gm-brand)' }}
          />
          <span>
            {order.deliveryMethod === 'delivery'
              ? 'Delivered to buyer'
              : 'Buyer meets seller to collect'}
          </span>
        </div>

        {order.deliveryAddress ? (
          <div className="gm-row" style={{ gap: 10 }}>
            <FontAwesomeIcon
              icon={faLocationDot}
              style={{ color: 'var(--gm-text-muted)' }}
            />
            <span className="gm-small">{order.deliveryAddress}</span>
          </div>
        ) : null}

        <div className="gm-row" style={{ gap: 10 }}>
          <FontAwesomeIcon
            icon={faPhone}
            style={{ color: 'var(--gm-text-muted)' }}
          />
          <span className="gm-small">{order.buyerPhone}</span>
        </div>

        {order.buyerNote ? (
          <p className="gm-small gm-muted" style={{ margin: 0 }}>
            Note: {order.buyerNote}
          </p>
        ) : null}
      </section>

      {/* Total */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 10 }}>
        <div className="gm-checkout-totals">
          <div>
            <span>Subtotal</span>
            <span>MWK {formatPrice(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 ? (
            <div>
              <span>Delivery</span>
              <span>MWK {formatPrice(order.deliveryFee)}</span>
            </div>
          ) : null}
          <div className="gm-checkout-grand">
            <span>Total</span>
            <strong>
              {order.currency} {formatPrice(order.total)}
            </strong>
          </div>
        </div>
      </section>

      <OrderActions order={order} role={isBuyer ? 'buyer' : 'seller'} />
    </div>
  );
}