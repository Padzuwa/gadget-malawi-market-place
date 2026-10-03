'use client';

import { useEffect, useRef } from 'react';
import { recordProductView } from '@/app/product/[slug]/actions';

type Props = {
  productId: string;
};

/**
 * Fires the view-count server action exactly once when the product
 * page mounts. Client-side so the Server Action can set cookies
 * (Server Components can't).
 *
 * Runs in an effect, not during render, so it never blocks paint.
 */
export function ProductViewTracker({ productId }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    recordProductView(productId).catch(() => {
      // Non-critical — never surface a tracking error
    });
  }, [productId]);

  return null;
}