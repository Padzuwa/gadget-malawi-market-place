'use client';

import { useEffect, useState } from 'react';

/**
 * Full-screen launch splash. Server-rendered so it appears immediately,
 * then fades out once the page has fully loaded.
 */
export function SplashScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function hide() {
      window.setTimeout(() => setHidden(true), 250);
    }

    if (document.readyState === 'complete') {
      hide();
      return;
    }

    window.addEventListener('load', hide, { once: true });
    return () => window.removeEventListener('load', hide);
  }, []);

  return (
    <div
      id="gm-splash"
      className={'gm-splash' + (hidden ? ' is-hidden' : '')}
      aria-label="Loading Gadget Malawi"
      aria-hidden={hidden}
    >
      <img
        className="gm-splash__logo"
        src="/icons/icon-512.png"
        alt="Gadget Malawi"
        width={128}
        height={128}
      />
      <p className="gm-splash__name">Gadget Malawi</p>
      <span className="gm-splash__loader" aria-hidden="true" />
    </div>
  );
}