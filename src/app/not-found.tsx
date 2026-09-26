import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  return (
    <div
      className="gm-card gm-card-pad"
      style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}
    >
      <span className="gm-eyebrow">404</span>
      <h1 className="gm-title" style={{ marginTop: 8, marginBottom: 12 }}>
        This page can't be found
      </h1>
      <p className="gm-muted" style={{ marginBottom: 22 }}>
        The gadget you're looking for might have been sold, renamed, or moved.
        Try browsing what's available right now.
      </p>
      <Link href="/browse" className="gm-btn gm-btn-primary">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
        Browse gadgets
      </Link>
    </div>
  );
}