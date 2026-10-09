import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCircleCheck,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import type { PublicProfile } from '@/lib/data/profiles';

export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const displayName =
    profile.shopName || profile.displayName || 'Unknown seller';

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const initial = displayName.charAt(0).toUpperCase() || '?';

  return (
    <div className="gm-public-hero">
      <div className="gm-public-avatar">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={displayName} />
        ) : (
          <span className="gm-public-avatar-initial">{initial}</span>
        )}
      </div>

      <div className="gm-public-hero-info">
        <h1 className="gm-public-name">
          {displayName}
          {profile.shopVerified ? (
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="gm-public-verified"
              aria-label="Verified shop"
            />
          ) : null}
        </h1>

        {profile.username ? (
          <span className="gm-public-username">@{profile.username}</span>
        ) : null}

        <div className="gm-public-meta">
          {profile.locationName ? (
            <span className="gm-public-meta-item">
              <FontAwesomeIcon icon={faLocationDot} />
              {profile.locationName}
            </span>
          ) : null}

          <span className="gm-public-meta-item">
            <FontAwesomeIcon icon={faCalendar} />
            Member since {memberSince}
          </span>
        </div>

        {profile.userType === 'shop' && profile.shopVerified ? (
          <span className="gm-public-type-badge">
            <FontAwesomeIcon icon={faCircleCheck} />
            Verified shop
          </span>
        ) : null}
      </div>
    </div>
  );
}