/**
 * Canonical site URL. Used in:
 *  - metadataBase (layout.tsx)
 *  - share links (WhatsApp, Facebook, X)
 *  - JSON-LD structured data (later)
 *
 * Override per environment with NEXT_PUBLIC_SITE_URL.
 * If not set, falls back to the production URL.
 */
export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
    'https://gadgetmalawi.mw');