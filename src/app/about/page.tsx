import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faBolt,
  faHandshake,
  faStore,
  faUsers,
  faBoltLightning,
} from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'About Gadget Malawi',
  description:
    'Why Gadget Malawi exists, who we build for, and how we keep every deal safe.',
};

const VALUES = [
  {
    icon: faShieldHalved,
    title: 'Trust before everything',
    body: 'Verified shops, held payments, honest reviews. Every feature we build asks: does this make the deal safer?',
  },
  {
    icon: faBolt,
    title: 'Fast on slow networks',
    body: 'Built for 3G, outages, and data bundles. Works offline, installs like an app, loads in under 2 seconds.',
  },
  {
    icon: faHandshake,
    title: 'Built for Malawi',
    body: 'Mobile money first, MWK prices, local cities, local support. Not a foreign template with a new logo.',
  },
];

const AUDIENCES = [
  {
    icon: faStore,
    title: 'Verified shops',
    body: 'Chichiri, Area 3, Mzuzu market. Real businesses that want a professional online presence.',
  },
  {
    icon: faUsers,
    title: 'Individuals',
    body: 'Anyone selling a phone, laptop, GPU, inverter. One item or fifty, same tools.',
  },
  {
    icon: faBoltLightning,
    title: 'Buyers who care',
    body: 'People who want to find the exact part without scrolling Facebook groups for two hours.',
  },
];

export default function AboutPage() {
  return (
    <div className="gm-stack" style={{ gap: 40, maxWidth: 900, margin: '0 auto' }}>
      {/* Hero */}
      <section className="gm-stack" style={{ gap: 14 }}>
        <span className="gm-eyebrow">About</span>
        <h1 className="gm-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
          A marketplace Malawians deserve.
        </h1>
        <p className="gm-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 640 }}>
          Gadget Malawi exists because buying a laptop shouldn&apos;t mean
          scrolling a Facebook group for two hours, sending money to a
          stranger, and hoping for the best. We built the missing layer:
          verified sellers, protected payments, and a search that actually
          works.
        </p>
      </section>

      {/* Story */}
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.3rem' }}>
          Why we started
        </h2>
        <p className="gm-muted" style={{ margin: 0, lineHeight: 1.65 }}>
          The Malawian tech market is real and thriving. Every day,
          thousands of phones, laptops, and PC parts change hands. But the
          infrastructure around them is broken. Prices are hidden behind
          &ldquo;DM for price.&rdquo; Sellers vanish after payment. There&apos;s no
          way to check whether a laptop is genuine before you hand over
          your money.
        </p>
        <p className="gm-muted" style={{ margin: 0, lineHeight: 1.65 }}>
          Gadget Malawi changes that. We hold payments until you confirm
          delivery. We verify shops with their National ID and physical
          address. We structure listings so every spec is visible before
          you click. It&apos;s the marketplace we wanted to shop on ourselves.
        </p>
      </section>

      {/* Values */}
      <section className="gm-stack" style={{ gap: 16 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.3rem' }}>
          What we believe
        </h2>
        <div className="gm-about-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="gm-card gm-card-pad gm-about-value">
              <div className="gm-about-icon">
                <FontAwesomeIcon icon={v.icon} />
              </div>
              <strong>{v.title}</strong>
              <p className="gm-muted" style={{ margin: 0 }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="gm-stack" style={{ gap: 16 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.3rem' }}>
          Who it&apos;s for
        </h2>
        <div className="gm-about-grid">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="gm-card gm-card-pad gm-about-value">
              <div className="gm-about-icon">
                <FontAwesomeIcon icon={a.icon} />
              </div>
              <strong>{a.title}</strong>
              <p className="gm-muted" style={{ margin: 0 }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gm-about-cta">
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.2rem' }}>
            Ready to buy or sell?
          </h2>
          <p className="gm-muted" style={{ marginTop: 6 }}>
            Join the growing number of Malawians using Gadget Malawi.
          </p>
        </div>
        <div className="gm-row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link href="/browse" className="gm-btn gm-btn-primary">
            Browse gadgets
          </Link>
          <Link href="/sell" className="gm-btn gm-btn-secondary">
            Start selling
          </Link>
        </div>
      </section>
    </div>
  );
}