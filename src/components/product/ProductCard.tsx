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

function formatPrice(amount: number | string | null | undefined): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function ProductCard({ product }: { product: Product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const href = `/product/${product.slug}`;

  return (
    <article className="gm-card gm-product-card">
      <Link href={href} className="gm-product-media" aria-label={product.title}>
        {imageFailed ? (
          <div className="gm-product-media-fallback">
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
          <Link href={href}>{product.title}</Link>
        </h3>

        <p className="gm-card-price">
          <span className="gm-card-price-currency">MWK</span>
          <span className="gm-card-price-value">{formatPrice(product.price)}</span>
        </p>

        <div className="gm-product-meta">
          {product.seller.verified ? (
            <span className="gm-badge gm-badge-verified">
              <FontAwesomeIcon icon={faCircleCheck} />
              Verified
            </span>
          ) : null}

          <span className="gm-product-location">
            <FontAwesomeIcon icon={faLocationDot} />
            {product.location}
          </span>
        </div>

        <Link href={href} className="gm-btn gm-btn-secondary gm-btn-sm gm-btn-block">
          More details
        </Link>
      </div>
    </article>
  );
}