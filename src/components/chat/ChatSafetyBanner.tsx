'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faXmark,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';

type Props = {
  conversationId: string;
};

const KEY_PREFIX = 'gm-chat-safety-seen:';

export function ChatSafetyBanner({ conversationId }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seen = window.localStorage.getItem(KEY_PREFIX + conversationId);
    if (!seen) setVisible(true);
  }, [conversationId]);

  function dismiss() {
    try {
      window.localStorage.setItem(KEY_PREFIX + conversationId, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="gm-chat-safety" role="status">
      <div className="gm-chat-safety-icon">
        <FontAwesomeIcon icon={faShieldHalved} />
      </div>

      <div className="gm-chat-safety-text">
        <strong>Stay safe on Gadget Malawi</strong>
        <span>
          Never send money outside the app. Meet in public places. Test
          electronics before paying. Report suspicious behaviour.
        </span>
      </div>

      <button
        type="button"
        className="gm-chat-safety-close"
        onClick={dismiss}
        aria-label="Dismiss safety notice"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}