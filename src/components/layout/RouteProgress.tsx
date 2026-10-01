'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thin progress bar at the top of the viewport that appears during
 * client-side navigation. Detects link clicks and completes when the
 * route changes. No external dependency.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // When the route changes, complete the bar
  useEffect(() => {
    setProgress(100);
    const t = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 260);
    return () => window.clearTimeout(t);
  }, [pathname, searchParams]);

  // Watch for internal link clicks and start the bar early
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a[href]') as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute('href') ?? '';
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // SPA navigation is about to happen
      setVisible(true);
      setProgress(12);
      window.setTimeout(() => setProgress(45), 120);
      window.setTimeout(() => setProgress(75), 500);
    }

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={`gm-route-progress${visible ? ' is-visible' : ''}`}
      role="progressbar"
      aria-hidden="true"
    >
      <div
        className="gm-route-progress-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}