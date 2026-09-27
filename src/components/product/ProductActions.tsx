'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShareNodes,
  faLink,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  faWhatsapp,
  faFacebookF,
  faInstagram,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { SITE_URL } from '@/lib/site';

function formatPrice(amount: number | string): string {
  const n = Math.round(Number(amount));
  if (!isFinite(n) || n < 0) return '0';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

type Props = {
  title: string;
  price: number;
  currency: string;
  slug: string;
};

export function ProductActions({ title, price, currency, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const [igHint, setIgHint] = useState(false);

  // Derived from a constant so server and client render identically.
  const shareUrl = `${SITE_URL}/product/${slug}`;
  const priceText = `${currency} ${formatPrice(price)}`;
  const shareText = `Check this out on Gadget Malawi: ${title} — ${priceText}`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${shareUrl}`
  )}`;

  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  }

  async function handleInstagram() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIgHint(true);
      window.setTimeout(() => setIgHint(false), 3500);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  }

  return (
    <div className="gm-share-row">
      <div className="gm-share-heading">
        <FontAwesomeIcon icon={faShareNodes} />
        <span>Share</span>
      </div>

      <div className="gm-share-icons">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-share-btn gm-share-whatsapp"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </a>

        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-share-btn gm-share-facebook"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <FontAwesomeIcon icon={faFacebookF} />
        </a>

        <button
          type="button"
          onClick={handleInstagram}
          className="gm-share-btn gm-share-instagram"
          aria-label="Share on Instagram"
          title="Share on Instagram"
        >
          <FontAwesomeIcon icon={faInstagram} />
        </button>

        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          className="gm-share-btn gm-share-x"
          aria-label="Share on X"
          title="Share on X"
        >
          <FontAwesomeIcon icon={faXTwitter} />
        </a>

        <button
          type="button"
          onClick={handleCopy}
          className="gm-share-btn gm-share-copy"
          aria-label="Copy link"
          title="Copy link"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faLink} />
        </button>
      </div>

      {igHint ? (
        <p className="gm-share-hint" role="status">
          Link copied — paste it into your Instagram story or DM.
        </p>
      ) : null}
    </div>
  );
}