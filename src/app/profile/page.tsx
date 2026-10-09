import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCircleCheck,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { getMyProfile } from '@/lib/data/profiles';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { ShopInfoForm } from '@/components/profile/ShopInfoForm';
import { VerificationSection } from '@/components/profile/VerificationSection';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { AccountSection } from '@/components/profile/AccountSection';

export const metadata: Metadata = {
  title: 'My profile',
  description: 'Manage your Gadget Malawi profile and shop information.',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/profile');

  const profile = await getMyProfile();
  if (!profile) {
    // Signed in, but profile couldn't be loaded. Don't loop back to login.
    return (
      <div
        className="gm-stack"
        style={{ gap: 16, maxWidth: 500, margin: '40px auto' }}
      >
        <div className="gm-card gm-card-pad">
          <h1 className="gm-title" style={{ margin: 0, fontSize: '1.3rem' }}>
            Could not load your profile
          </h1>
          <p className="gm-muted" style={{ marginTop: 10 }}>
            Something went wrong on our side. Please refresh the page. If the
            problem continues, contact support.
          </p>
        </div>
      </div>
    );
  }

  const { data: locationsData } = await supabase
    .from('locations')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const locations = (locationsData ?? []) as { id: string; name: string }[];

  const displayName =
    profile.shopName || profile.displayName || 'Your profile';
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="gm-stack" style={{ gap: 24, maxWidth: 780 }}>
      <div className="gm-profile-hero">
        <AvatarUpload
          currentUrl={profile.avatarUrl}
          displayName={displayName}
        />

        <div className="gm-profile-hero-info">
          <h1 className="gm-title" style={{ margin: 0, fontSize: '1.5rem' }}>
            {displayName}
            {profile.shopVerified ? (
              <FontAwesomeIcon
                icon={faCircleCheck}
                style={{ marginLeft: 8, color: 'var(--gm-info)' }}
                aria-label="Verified shop"
              />
            ) : null}
          </h1>

          <div className="gm-profile-hero-meta">
            {profile.username ? (
              <span className="gm-small gm-muted">@{profile.username}</span>
            ) : null}
            {profile.locationName ? (
              <span className="gm-small gm-muted">
                <FontAwesomeIcon icon={faLocationDot} /> {profile.locationName}
              </span>
            ) : null}
            <span className="gm-small gm-muted">
              Member since {memberSince}
            </span>
          </div>

          {profile.username ? (
            <Link
              href={`/profile/${profile.username}?preview=1`}
              className="gm-profile-preview-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview public profile
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </Link>
          ) : null}
        </div>
      </div>

      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
            Identity
          </h2>
          <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
            How buyers see you across Gadget Malawi.
          </p>
        </div>
        <ProfileEditForm profile={profile} locations={locations} />
      </section>

      {profile.userType === 'shop' ? (
        <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
          <div>
            <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
              Shop information
            </h2>
            <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
              These details appear on your public profile.
            </p>
          </div>
          <ShopInfoForm profile={profile} />
        </section>
      ) : null}

      {profile.userType === 'shop' ? (
        <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
          <div>
            <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
              Verification
            </h2>
            <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
              Verified shops get a blue badge and appear higher in search.
            </p>
          </div>
          <VerificationSection profile={profile} />
        </section>
      ) : null}

      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
            Preferences
          </h2>
          <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
            App theme and display.
          </p>
        </div>
        <PreferencesSection />
      </section>

      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.1rem' }}>
            Account
          </h2>
        </div>
        <AccountSection email={profile.email ?? ''} />
      </section>
    </div>
  );
}