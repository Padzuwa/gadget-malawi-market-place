import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trust & safety',
  description: 'How Gadget Malawi keeps every deal secure.',
};

export default function TrustPage() {
  return (
    <div className="gm-stack" style={{ gap: 16, maxWidth: 640 }}>
      <span className="gm-eyebrow">Trust & safety</span>
      <h1 className="gm-title">Buying safely on Gadget Malawi</h1>
      <p className="gm-muted">
        Detailed trust and safety guidance is coming soon. The essentials for
        now: keep conversations in the app, pay through Gadget Malawi, meet
        sellers in public places, and test electronics before accepting them.
      </p>
    </div>
  );
}