'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

type Props = {
  photos: string[];
  shopName: string;
};

export function PublicShopGallery({ photos, shopName }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? null : (i + 1) % photos.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? null : (i - 1 + photos.length) % photos.length));
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="gm-public-gallery">
        {photos.map((url, i) => (
          <button
            key={url}
            type="button"
            className="gm-public-gallery-item"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1}`}
          >
            <img src={url} alt={`${shopName} photo ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null ? (
        <div
          className="gm-lightbox"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="gm-lightbox-close"
            onClick={() => setOpen(null)}
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="gm-lightbox-nav gm-lightbox-prev"
                onClick={() =>
                  setOpen((open - 1 + photos.length) % photos.length)
                }
                aria-label="Previous"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button
                type="button"
                className="gm-lightbox-nav gm-lightbox-next"
                onClick={() => setOpen((open + 1) % photos.length)}
                aria-label="Next"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </>
          ) : null}

          <img
            className="gm-lightbox-image"
            src={photos[open]}
            alt={`${shopName} photo ${open + 1}`}
          />

          <span className="gm-lightbox-counter">
            {open + 1} / {photos.length}
          </span>
        </div>
      ) : null}
    </>
  );
}