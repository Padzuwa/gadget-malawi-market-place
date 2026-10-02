import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { getMyOrders } from '@/lib/data/orders';
import { OrderCard } from '@/components/orders/OrderCard';

export const metadata: Metadata = {
  title: 'My orders',
  description: 'Your purchases on Gadget Malawi.',
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/orders');

  const orders = await getMyOrders();

  return (
    <div className="gm-stack" style={{ gap: 24 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="gm-eyebrow">Purchases</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            My orders
          </h1>
        </div>
        <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-sm">
          <FontAwesomeIcon icon={faArrowLeft} />
          Keep shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="gm-fav-empty">
          <FontAwesomeIcon icon={faBoxOpen} />
          <h2 className="gm-section-title" style={{ marginTop: 14 }}>
            No orders yet
          </h2>
          <p className="gm-muted" style={{ marginTop: 8, marginBottom: 22 }}>
            When you buy something, it appears here.
          </p>
          <Link href="/browse" className="gm-btn gm-btn-primary">
            Browse gadgets
          </Link>
        </div>
      ) : (
        <div className="gm-stack" style={{ gap: 14 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} role="buyer" />
          ))}
        </div>
      )}
    </div>
  );
}