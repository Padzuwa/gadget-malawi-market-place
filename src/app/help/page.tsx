import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help centre',
  description: 'Guides for buying and selling on Gadget Malawi.',
};

export default function HelpPage() {
  return (
    <div className="gm-stack" style={{ gap: 16, maxWidth: 640 }}>
      <span className="gm-eyebrow">Support</span>
      <h1 className="gm-title">Help centre</h1>
      <p className="gm-muted">
        Step-by-step guides for buying, selling, and staying safe are coming
        soon. In the meantime, message us at{' '}
        <a
          href="mailto:hello@gadgetmalawi.mw"
          style={{ color: 'var(--gm-brand)', fontWeight: 700 }}
        >
          hello@gadgetmalawi.mw
        </a>{' '}
        or via WhatsApp.
      </p>
    </div>
  );
}