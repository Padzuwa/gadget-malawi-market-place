import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faCircleCheck,
  faClock,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import type { OwnProfile } from '@/lib/data/profiles';

export function VerificationSection({ profile }: { profile: OwnProfile }) {
  const submitted = !!profile.verificationSubmittedAt;
  const verified = profile.shopVerified;

  if (verified) {
    return (
      <div className="gm-verify-card is-verified">
        <div className="gm-verify-icon">
          <FontAwesomeIcon icon={faCircleCheck} />
        </div>
        <div className="gm-verify-body">
          <strong>Verified shop</strong>
          <span>
            {profile.verifiedAt
              ? `Verified on ${new Date(
                  profile.verifiedAt
                ).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}.`
              : 'Your shop is verified.'}{' '}
            Your listings show a blue checkmark everywhere.
          </span>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="gm-verify-card is-pending">
        <div className="gm-verify-icon">
          <FontAwesomeIcon icon={faClock} />
        </div>
        <div className="gm-verify-body">
          <strong>Verification under review</strong>
          <span>
            Submitted on{' '}
            {new Date(profile.verificationSubmittedAt!).toLocaleDateString(
              'en-GB',
              { day: 'numeric', month: 'short', year: 'numeric' }
            )}
            . We usually review within 2 working days.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="gm-verify-card">
      <div className="gm-verify-icon">
        <FontAwesomeIcon icon={faShieldHalved} />
      </div>
      <div className="gm-verify-body">
        <strong>Get verified</strong>
        <span>
          Upload your National ID and shop documents to earn the verified
          badge. Verified shops appear higher in search and buyers trust them
          more.
        </span>
      </div>
      <Link
        href="/profile/verify"
        className="gm-btn gm-btn-primary gm-btn-sm"
      >
        Get verified <FontAwesomeIcon icon={faArrowRight} />
      </Link>
    </div>
  );
}