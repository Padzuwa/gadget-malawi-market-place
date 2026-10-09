'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faShareNodes,
  faLink,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  faWhatsapp,
  faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import { startUserConversation } from '@/app/messages/actions';
import { SITE_URL } from '@/lib/site';

type Props = {
  userId: string;
  username: string;
  displayName: string;
};

export function PublicProfileActions({
  userId,
  username,
  displayName,
}: Props) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `${SITE_URL}/profile/${username}`;
  const shareText = `Check out ${displayName} on Gadget Malawi`;

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${profileUrl}`
  )}`;

  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    profileUrl
  )}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this link:', profileUrl);
    }
  }

  return (
    <div className="gm-public-actions">
      <form
        action={startUserConversation}
        style={{ display: 'block', flex: 1 }}
      >
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="username" value={username} />
        <button
          type="submit"
          className="gm-btn gm-btn-primary gm-btn-block"
        >
          <FontAwesomeIcon icon={faComment} />
          Chat with seller
        </button>
      </form>

      <div className="gm-public-share">
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
          className="gm-share-btn gm-share-copy"
          onClick={handleCopy}
          aria-label="Copy link"
          title="Copy link"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faLink} />
        </button>
      </div>
    </div>
  );
}