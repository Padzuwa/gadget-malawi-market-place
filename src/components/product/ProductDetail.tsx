'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCircleCheck,
  faComment,
  faCartShopping,
  faTag,
  faArrowLeft,
  faImage,
  faHeart,
  faShieldHalved,
  faBolt,
  faTruck,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import type { Product } from '@/lib/types';
import { startConversation } from '@/app/messages/actions';

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
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  function handleAddToCart() {
    // Placeholder until cart is built in Step 19
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1800);
  }

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
        {/* Gallery */}
        <div className="gm-gallery">
          <div className="gm-gallery-main">
            {imageFailed ? (
              <div className="gm-gallery-fallback">
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

        {/* Info column */}
        <div className="gm-stack" style={{ gap: 16 }}>
          {/* Top row: badges + favorite */}
          <div className="gm-product-detail-top">
            <div className="gm-row" style={{ gap: 8, flexWrap: 'wrap' }}>
              <span className="gm-badge gm-badge-new">
                {conditionLabels[product.condition]}
              </span>
              <span className="gm-badge">{product.category}</span>
            </div>

            <button
              type="button"
              className={`gm-icon-btn gm-product-fav${
                isFavorite ? ' is-favorite' : ''
              }`}
              onClick={() => setIsFavorite((v) => !v)}
              aria-label={
                isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
            >
              <FontAwesomeIcon icon={faHeart} />
            </button>
          </div>

          {/* Title + subtitle */}
          <h1 className="gm-title" style={{ margin: 0 }}>
            {product.title}
          </h1>

          {product.subtitle ? (
            <p className="gm-muted" style={{ margin: 0, fontSize: '1rem' }}>
              {product.subtitle}
            </p>
          ) : null}

          {/* Price + rating */}
          <div className="gm-price-block">
            <strong className="gm-price-hero">
              <small>{product.currency}</small>
              {formatPrice(product.price)}
            </strong>
            <span className="gm-rating" aria-label="Seller rating">
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <FontAwesomeIcon icon={faStar} />
              <span className="gm-small gm-muted">4.8</span>
            </span>
          </div>

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

            <form action={startConversation} style={{ display: 'block' }}>
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

          {/* Trust strip */}
          <div className="gm-trust-strip">
            <div className="gm-trust-item">
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>Secure payment</span>
            </div>
            <div className="gm-trust-item">
              <FontAwesomeIcon icon={faBolt} />
              <span>Fast reply</span>
            </div>
            <div className="gm-trust-item">
              <FontAwesomeIcon icon={faTruck} />
              <span>Delivery available</span>
            </div>
          </div>

          {/* Description */}
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

          {/* Sticky buy bar */}
          <div className="gm-sticky-buy">
            <div className="gm-sticky-buy-info">
              <strong className="gm-sticky-price">
                <small>{product.currency}</small>
                {formatPrice(product.price)}
              </strong>
              <span className="gm-sticky-hint">
                <FontAwesomeIcon icon={faShieldHalved} />
                Secure checkout · Buyer protection
              </span>
            </div>

            <div className="gm-sticky-buy-actions">
              <button
                type="button"
                className="gm-btn gm-btn-secondary"
                onClick={handleAddToCart}
                aria-live="polite"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                <span>{addedToCart ? 'Added' : 'Add to cart'}</span>
              </button>

              <button type="button" className="gm-btn gm-btn-primary gm-btn-buy">
                <FontAwesomeIcon icon={faTag} />
                <span>Buy now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}