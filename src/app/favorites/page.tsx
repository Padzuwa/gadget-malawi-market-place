import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { getMyFavorites } from '@/lib/data/favorites';
import { ProductGrid } from '@/components/home/ProductGrid';

export const metadata: Metadata = {
  title: 'Favorites',
  description: 'Your saved gadgets on Gadget Malawi.',
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/favorites');

  const products = await getMyFavorites();

  return (
    <div className="gm-stack" style={{ gap: 24 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 14 }}>
        <div>
          <span className="gm-eyebrow">Saved for later</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            Favorites
          </h1>
          <p className="gm-muted" style={{ marginTop: 8, maxWidth: 560 }}>
            {products.length === 0
              ? 'Items you tap the heart on will show up here.'
              : `${products.length} item${products.length === 1 ? '' : 's'} saved.`}
          </p>
        </div>
        <Link href="/browse" className="gm-btn gm-btn-ghost gm-btn-sm">
          <FontAwesomeIcon icon={faArrowLeft} />
          Keep browsing
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="gm-fav-empty">
          <FontAwesomeIcon icon={faHeart} />
          <h2 className="gm-section-title" style={{ marginTop: 14 }}>
            Nothing saved yet
          </h2>
          <p className="gm-muted" style={{ marginTop: 8, marginBottom: 22 }}>
            Tap the heart on any listing to save it here for later.
          </p>
          <Link href="/browse" className="gm-btn gm-btn-primary">
            Browse gadgets
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}