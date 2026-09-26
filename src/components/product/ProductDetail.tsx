'use client';

import { useState } from 'react';
import { startConversation } from '@/app/messages/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCircleCheck,
  faComment,
  faCartShopping,
  faTag,
  faArrowLeft,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import type { Product } from '@/lib/types';

const conditionLabels: Record<Product['condition'], string> = {
  new: 'New',
  'like-new': 'Like new',
  used: 'Used',
};

function formatPrice(amount: number | string | null | undefined): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type ProductDetailProps = {
  product: Product;
  galleryImages: string[];
};

export function ProductDetail({ product, galleryImages }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="gm-stack" style={{ gap: 20 }}>
      <Link
        href="/browse"
        className="gm-btn gm-btn-ghost gm-btn-sm"
        style={{ width: 'fit-content' }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back to browse
      </Link>

      <div className="gm-product-detail">
        <div className="gm-gallery">
          <div className="gm-gallery-main">
            {imageFailed ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--gm-text-subtle)',
                  fontSize: '4rem',
                }}
              >
                <FontAwesomeIcon icon={faImage} />
              </div>
            ) : (
              <img
                src={galleryImages[activeImage]}
                alt={product.title}
                onError={() => setImageFailed(true)}
              />
            )}
          </div>

          {galleryImages.length > 1 && !imageFailed ? (
            <div className="gm-gallery-thumbs">
              {galleryImages.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={`gm-gallery-thumb${
                    i === activeImage ? ' is-active' : ''
                  }`}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="gm-stack" style={{ gap: 16 }}>
          <div className="gm-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="gm-badge gm-badge-new">
              {conditionLabels[product.condition]}
            </span>
            <span className="gm-badge">{product.category}</span>
          </div>

          <h1 className="gm-title" style={{ margin: 0 }}>
            {product.title}
          </h1>

          <p className="gm-muted" style={{ margin: 0, fontSize: '1rem' }}>
            {product.subtitle}
          </p>

          <strong
            className="gm-price"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)' }}
          >
            <small>{product.currency} </small>
            {formatPrice(product.price)}
          </strong>

          {/* Seller card */}
          <div className="gm-card gm-card-pad gm-stack" style={{ gap: 12 }}>
            <div className="gm-row" style={{ gap: 12 }}>
              <span className="gm-avatar">
                {product.seller.name.charAt(0)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block' }}>
                  {product.seller.name}
                  {product.seller.verified ? (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      style={{ marginLeft: 6, color: 'var(--gm-info)' }}
                    />
                  ) : null}
                </strong>
                <span className="gm-small gm-muted">
                  <FontAwesomeIcon icon={faLocationDot} /> {product.location}
                </span>
              </div>
            </div>

        <form action={startConversation}>
  <input type="hidden" name="productId" value={product.id} />
  <button
    type="submit"
    className="gm-btn gm-btn-secondary gm-btn-block"
  >
    <FontAwesomeIcon icon={faComment} />
    Chat with seller
  </button>
</form>
          </div>

          {/* Description — now correctly outside the seller card */}
          <div className="gm-stack" style={{ gap: 8 }}>
            <strong
              className="gm-section-title"
              style={{ fontSize: '1.05rem' }}
            >
              Description
            </strong>
            <p className="gm-muted" style={{ margin: 0 }}>
              Reliable device, well maintained and ready to use. Comes exactly
              as described in the title and specs. Reach out to the seller for
              extra photos or details.
            </p>
          </div>

          {/* Sticky buy bar — now correctly outside the seller card */}
          <div className="gm-sticky-buy">
            <button type="button" className="gm-btn gm-btn-accent">
              <FontAwesomeIcon icon={faTag} />
              Buy with Airtel Money
            </button>
            <button type="button" className="gm-btn gm-btn-primary">
              <FontAwesomeIcon icon={faCartShopping} />
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}