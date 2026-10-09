import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faClock,
  faLocationDot,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileByUsername,
  getPublicListings,
} from '@/lib/data/profiles';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PublicProfileActions } from '@/components/profile/PublicProfileActions';
import { PublicShopGallery } from '@/components/profile/PublicShopGallery';
import { ProductGrid } from '@/components/home/ProductGrid';

type PageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return { title: 'Profile not found' };
  }

  const displayName = profile.shopName || profile.displayName || username;
  const location = profile.locationName ? ` · ${profile.locationName}` : '';

  return {
    title: displayName,
    description:
      profile.bio ||
      `${displayName} on Gadget Malawi${location}. Browse their active listings.`,
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const { preview } = await searchParams;

  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  // If this is your own profile, send to the edit view — UNLESS the
  // caller explicitly asked for the preview (query param `?preview=1`).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnProfile = !!user && user.id === profile.id;
  const isPreview = preview === '1';

  if (isOwnProfile && !isPreview) {
    redirect('/profile');
  }

  const listings = await getPublicListings(profile.id);

  const displayName =
    profile.shopName || profile.displayName || 'Unknown seller';

  const isShop = profile.userType === 'shop';

  return (
    <div className="gm-stack" style={{ gap: 24 }}>
      {/* Preview banner — only shown when you're viewing your own profile */}
      {isOwnProfile && isPreview ? (
        <div className="gm-preview-banner">
          <span>
            You are previewing your public profile. This is what buyers see.
          </span>
          <Link
            href="/profile"
            className="gm-btn gm-btn-secondary gm-btn-sm"
          >
            Back to edit
          </Link>
        </div>
      ) : null}

      {/* Header */}
      <ProfileHeader profile={profile} />

      {/* Actions */}
      {profile.username ? (
        <PublicProfileActions
          userId={profile.id}
          username={profile.username}
          displayName={displayName}
        />
      ) : null}

      {/* Bio */}
      {profile.bio ? (
        <section className="gm-card gm-card-pad gm-stack" style={{ gap: 10 }}>
          <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
            About
          </h2>
          <p
            className="gm-muted"
            style={{ margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}
          >
            {profile.bio}
          </p>
        </section>
      ) : null}

      {/* Shop info */}
      {isShop && (profile.shopAddress || profile.businessHours) ? (
        <section className="gm-card gm-card-pad gm-stack" style={{ gap: 12 }}>
          <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
            <FontAwesomeIcon icon={faStore} style={{ marginRight: 8 }} />
            Shop information
          </h2>

          {profile.shopAddress ? (
            <div className="gm-public-info-row">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{profile.shopAddress}</span>
            </div>
          ) : null}

          {profile.businessHours ? (
            <div className="gm-public-info-row">
              <FontAwesomeIcon icon={faClock} />
              <span>{profile.businessHours}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Shop photos */}
      {isShop && profile.shopPhotos.length > 0 ? (
        <section className="gm-stack" style={{ gap: 12 }}>
          <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
            Photos
          </h2>
          <PublicShopGallery
            photos={profile.shopPhotos}
            shopName={displayName}
          />
        </section>
      ) : null}

      {/* Listings */}
      <section className="gm-stack" style={{ gap: 14 }}>
        <div className="gm-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="gm-section-title" style={{ fontSize: '1.15rem' }}>
              {listings.length > 0
                ? `${listings.length} active listing${listings.length === 1 ? '' : 's'}`
                : 'Active listings'}
            </h2>
          </div>

          {listings.length > 0 ? (
            <Link
              href={`/browse?seller=${profile.id}`}
              className="gm-btn gm-btn-ghost gm-btn-sm"
            >
              View in browse
            </Link>
          ) : null}
        </div>

        {listings.length > 0 ? (
          <ProductGrid products={listings} />
        ) : (
          <div
            className="gm-card gm-card-pad"
            style={{ textAlign: 'center', paddingBlock: 40 }}
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              style={{
                fontSize: '2rem',
                color: 'var(--gm-brand)',
                opacity: 0.5,
              }}
            />
            <p className="gm-muted" style={{ margin: '12px 0 0' }}>
              No active listings right now.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}