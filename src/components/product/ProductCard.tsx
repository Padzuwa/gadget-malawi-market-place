'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faCircleCheck,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import type { Product } from '@/lib/types';

const conditionLabels: Record<Product['condition'], string> = {
  new: 'New',
  'like-new': 'Like new',
  used: 'Used',
};

const conditionClasses: Record<Product['condition'], string> = {
  new: 'gm-badge-new',
  'like-new': 'gm-badge-new',
  used: 'gm-badge-used',
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-MW', { maximumFractionDigits: 0 }).format(
    amount
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="gm-card gm-product-card">
      <Link href={`/product/${product.slug}`} className="gm-product-media">
        {imageFailed ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              background: 'var(--gm-surface-raised)',
              color: 'var(--gm-text-subtle)',
              fontSize: '2rem',
            }}
          >
            <FontAwesomeIcon icon={faImage} />
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <span className={`gm-badge ${conditionClasses[product.condition]}`}>
          {conditionLabels[product.condition]}
        </span>
      </Link>

      <div className="gm-product-info">
        <h3 className="gm-product-title">
          <Link href={`/product/${product.slug}`}>{product.title}</Link>
        </h3>

        <strong className="gm-price">
          <small>{product.currency} </small>
          {formatPrice(product.price)}
        </strong>

        <div className="gm-product-meta">
          {product.seller.verified ? (
            <span className="gm-badge gm-badge-verified">
              <FontAwesomeIcon icon={faCircleCheck} />
              Verified
            </span>
          ) : (
            <span className="gm-small gm-muted">{product.seller.name}</span>
          )}

          <span className="gm-product-location">
            <FontAwesomeIcon icon={faLocationDot} />
            {product.location}
          </span>
        </div>

        <div className="gm-product-actions">
          <Link
            href={`/product/${product.slug}`}
            className="gm-btn gm-btn-primary gm-btn-sm"
          >
            View item
          </Link>
          <button
            type="button"
            className="gm-btn gm-btn-secondary gm-btn-sm"
          >
            Chat
          </button>
        </div>
      </div>
    </article>
  );
}