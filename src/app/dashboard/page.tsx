import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { getMyListings, computeStats } from '@/lib/data/seller';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ListingRow } from '@/components/dashboard/ListingRow';

export const metadata: Metadata = {
  title: 'My dashboard',
  description: 'Manage your Gadget Malawi listings.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const listings = await getMyListings();
  const stats = computeStats(listings);

  return (
    <div className="gm-stack" style={{ gap: 28 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div>
          <span className="gm-eyebrow">Seller dashboard</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            My listings
          </h1>
          <p className="gm-muted" style={{ marginTop: 8 }}>
            Manage your listings, update prices, and mark items as sold.
          </p>
        </div>

        <Link href="/sell" className="gm-btn gm-btn-primary">
          <FontAwesomeIcon icon={faPlus} />
          New listing
        </Link>
      </div>

      <DashboardStats stats={stats} />

      {listings.length === 0 ? (
        <div
          className="gm-card gm-card-pad"
          style={{ textAlign: 'center', paddingBlock: 48 }}
        >
          <FontAwesomeIcon
            icon={faBoxOpen}
            style={{ fontSize: '2.4rem', color: 'var(--gm-brand)' }}
          />
          <h2 className="gm-section-title" style={{ marginTop: 14 }}>
            No listings yet
          </h2>
          <p className="gm-muted" style={{ marginTop: 8, marginBottom: 22 }}>
            Post your first gadget and reach buyers across Malawi.
          </p>
          <Link href="/sell" className="gm-btn gm-btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="gm-stack" style={{ gap: 12 }}>
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}