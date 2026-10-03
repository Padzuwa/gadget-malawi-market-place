import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faComment,
  faCartShopping,
  faLock,
  faTruck,
  faCircleCheck,
  faStore,
  faCamera,
  faIdCard,
  faMoneyBillWave,
} from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How buying and selling works on Gadget Malawi — step by step, buyer and seller.',
};

const BUYER_STEPS = [
  {
    icon: faMagnifyingGlass,
    title: 'Find the right gadget',
    body: 'Filter by category, location, condition, and price. Every listing shows specs, photos, and the real MWK price — no "DM for price".',
  },
  {
    icon: faComment,
    title: 'Chat with the seller',
    body: 'Ask questions directly in the app. Verify condition, ask for extra photos, or confirm pickup details. Your phone number stays private.',
  },
  {
    icon: faCartShopping,
    title: 'Add to cart and checkout',
    body: 'Buy one item or many. Your cart holds items from multiple sellers and splits them into separate orders at checkout.',
  },
  {
    icon: faLock,
    title: 'Pay securely',
    body: 'Pay with Airtel Money or TNM Mpamba. Your money is held safely until you confirm the item works.',
  },
  {
    icon: faTruck,
    title: 'Receive or meet',
    body: 'Choose delivery or meet the seller in person. Test the device. Then confirm delivery in the app.',
  },
  {
    icon: faCircleCheck,
    title: 'Funds released',
    body: 'Once you confirm the item is what was promised, the seller gets paid. If something is wrong, open a dispute instead.',
  },
];

const SELLER_STEPS = [
  {
    icon: faStore,
    title: 'Create your profile',
    body: 'Individuals and shops both welcome. Verified shops upload a National ID and physical address to earn a trust badge.',
  },
  {
    icon: faCamera,
    title: 'List your gadget',
    body: 'Add photos (at least 2), set a clear price, and fill in the specs. Our dynamic form asks for the right details for each category.',
  },
  {
    icon: faComment,
    title: 'Talk to buyers',
    body: 'Answer questions in the in-app chat. No need to hand out your WhatsApp number to strangers.',
  },
  {
    icon: faMoneyBillWave,
    title: 'Get paid securely',
    body: 'When a buyer pays, funds are held until they confirm delivery. No chargebacks, no fake "I never got it" claims.',
  },
  {
    icon: faTruck,
    title: 'Deliver or meet',
    body: 'Ship to the buyer or agree on a pickup point. Mark the order as shipped so both sides stay informed.',
  },
  {
    icon: faCircleCheck,
    title: 'Funds arrive',
    body: 'Once the buyer confirms, payment lands in your account. Build reviews, earn a track record, get found more often.',
  },
];

const TRUST_POINTS = [
  {
    title: 'Verified shops',
    body: 'Shops upload a National ID and physical address. Their listings show a blue verified tick.',
  },
  {
    title: 'Escrow-protected payments',
    body: 'Funds are held until the buyer confirms delivery. No more "sent the money and never heard from them again."',
  },
  {
    title: 'In-app chat',
    body: 'Message sellers without giving out your phone number. Every conversation is stored for dispute resolution.',
  },
  {
    title: 'Report any listing',
    body: 'See a scam, a stolen item, or a bad actor? One tap flags it for our team.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="gm-stack" style={{ gap: 48, maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero */}
      <section className="gm-stack" style={{ gap: 14 }}>
        <span className="gm-eyebrow">How it works</span>
        <h1
          className="gm-display"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}
        >
          Simple for buyers. Fair for sellers.
        </h1>
        <p
          className="gm-muted"
          style={{ fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 640 }}
        >
          Six steps to buy. Six steps to sell. In between, a payment system
          built on trust — because that&apos;s what the Malawian marketplace
          has been missing.
        </p>
      </section>

      {/* Buyer flow */}
      <section className="gm-stack" style={{ gap: 20 }}>
        <div className="gm-how-head">
          <span className="gm-badge gm-badge-verified">For buyers</span>
          <h2 className="gm-section-title" style={{ fontSize: '1.5rem' }}>
            Buying on Gadget Malawi
          </h2>
        </div>

        <div className="gm-how-grid">
          {BUYER_STEPS.map((step, i) => (
            <div key={step.title} className="gm-card gm-card-pad gm-how-step">
              <div className="gm-how-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="gm-how-icon">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <strong>{step.title}</strong>
              <p className="gm-muted" style={{ margin: 0 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Seller flow */}
      <section className="gm-stack" style={{ gap: 20 }}>
        <div className="gm-how-head">
          <span className="gm-badge gm-badge-new">For sellers</span>
          <h2 className="gm-section-title" style={{ fontSize: '1.5rem' }}>
            Selling on Gadget Malawi
          </h2>
        </div>

        <div className="gm-how-grid">
          {SELLER_STEPS.map((step, i) => (
            <div key={step.title} className="gm-card gm-card-pad gm-how-step">
              <div className="gm-how-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="gm-how-icon">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <strong>{step.title}</strong>
              <p className="gm-muted" style={{ margin: 0 }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="gm-stack" style={{ gap: 20 }}>
        <div className="gm-how-head">
          <span className="gm-badge">Trust & safety</span>
          <h2 className="gm-section-title" style={{ fontSize: '1.5rem' }}>
            How we keep every deal safe
          </h2>
        </div>

        <div className="gm-how-trust-grid">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="gm-card gm-card-pad gm-how-trust">
              <strong>{t.title}</strong>
              <p className="gm-muted" style={{ margin: 0 }}>
                {t.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="gm-about-cta">
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.2rem' }}>
            Ready to get started?
          </h2>
          <p className="gm-muted" style={{ marginTop: 6 }}>
            Browse existing listings, or list your first gadget in under a
            minute.
          </p>
        </div>
        <div className="gm-row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <Link href="/browse" className="gm-btn gm-btn-primary">
            Browse gadgets
          </Link>
          <Link href="/sell" className="gm-btn gm-btn-secondary">
            Sell a gadget
          </Link>
        </div>
      </section>
    </div>
  );
}