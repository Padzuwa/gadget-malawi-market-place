'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisVertical,
  faPenToSquare,
  faEye,
  faPlay,
  faPause,
  faCircleCheck,
  faBoxArchive,
  faTrash,
  faImage,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { updateListingStatus, deleteListing } from '@/app/dashboard/actions';
import type { SellerListing } from '@/lib/data/seller';
import type { ProductStatus } from '@/lib/types';

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-MW', { maximumFractionDigits: 0 }).format(
    amount
  );
}

const statusLabels: Record<ProductStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  sold: 'Sold',
  archived: 'Archived',
};

const statusClasses: Record<ProductStatus, string> = {
  draft: '',
  active: 'gm-badge-new',
  paused: 'gm-badge-used',
  sold: 'gm-badge-sold',
  archived: '',
};

export function ListingRow({ listing }: { listing: SellerListing }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function changeStatus(status: ProductStatus) {
    setError(null);
    setMenuOpen(false);
    startTransition(async () => {
      const result = await updateListingStatus(listing.id, status);
      if (!result.ok) setError(result.error);
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteListing(listing.id);
      if (!result.ok) {
        setError(result.error);
        setConfirmDelete(false);
      }
    });
  }

  return (
    <div className="gm-listing-row">
      {/* Thumbnail */}
      <Link
        href={`/product/${listing.slug}`}
        className="gm-listing-thumb"
        aria-label={listing.title}
      >
        {listing.primaryImageUrl ? (
          <img src={listing.primaryImageUrl} alt={listing.title} />
        ) : (
          <span className="gm-listing-thumb-fallback">
            <FontAwesomeIcon icon={faImage} />
          </span>
        )}
      </Link>

      {/* Main info */}
      <div className="gm-listing-info">
        <Link href={`/product/${listing.slug}`} className="gm-listing-title">
          {listing.title}
        </Link>

        <div className="gm-listing-meta">
          <strong className="gm-price" style={{ fontSize: '0.9rem' }}>
            <small>{listing.currency} </small>
            {formatPrice(listing.price)}
          </strong>

          <span className={`gm-badge ${statusClasses[listing.status]}`}>
            {statusLabels[listing.status]}
          </span>

          {listing.categoryName ? (
            <span className="gm-small gm-muted">{listing.categoryName}</span>
          ) : null}

          {listing.locationName ? (
            <span className="gm-small gm-muted">· {listing.locationName}</span>
          ) : null}
        </div>

        <div className="gm-listing-stats">
          <span className="gm-xs gm-subtle">
            <FontAwesomeIcon icon={faEye} /> {listing.viewsCount} views
          </span>
        </div>

        {error ? (
          <p
            className="gm-xs"
            style={{ color: 'var(--gm-danger)', margin: 0 }}
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

      {/* Actions */}
      <div className="gm-listing-actions" ref={menuRef}>
        <Link
          href={`/dashboard/listing/${listing.id}/edit`}
          className="gm-btn gm-btn-secondary gm-btn-sm"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
          <span>Edit</span>
        </Link>

        <button
          type="button"
          className="gm-icon-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="More actions"
          aria-expanded={menuOpen}
          disabled={pending}
        >
          <FontAwesomeIcon icon={pending ? faSpinner : faEllipsisVertical} spin={pending} />
        </button>

        {menuOpen ? (
          <div className="gm-listing-menu gm-card">
            {listing.status !== 'active' ? (
              <button type="button" onClick={() => changeStatus('active')}>
                <FontAwesomeIcon icon={faPlay} /> Activate
              </button>
            ) : null}

            {listing.status === 'active' ? (
              <button type="button" onClick={() => changeStatus('paused')}>
                <FontAwesomeIcon icon={faPause} /> Pause
              </button>
            ) : null}

            {listing.status !== 'sold' ? (
              <button type="button" onClick={() => changeStatus('sold')}>
                <FontAwesomeIcon icon={faCircleCheck} /> Mark as sold
              </button>
            ) : null}

            {listing.status !== 'archived' ? (
              <button type="button" onClick={() => changeStatus('archived')}>
                <FontAwesomeIcon icon={faBoxArchive} /> Archive
              </button>
            ) : null}

            <div className="gm-listing-menu-divider" />

            {confirmDelete ? (
              <div className="gm-listing-menu-confirm">
                <p className="gm-xs" style={{ margin: 0 }}>
                  Delete permanently?
                </p>
                <div className="gm-row" style={{ gap: 6, marginTop: 6 }}>
                  <button
                    type="button"
                    className="gm-btn gm-btn-sm"
                    style={{ background: 'var(--gm-danger)', color: 'white' }}
                    onClick={handleDelete}
                    disabled={pending}
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-ghost gm-btn-sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="is-danger"
              >
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}