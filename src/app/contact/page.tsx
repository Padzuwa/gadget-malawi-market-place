import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWhatsapp,
  faFacebookF,
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faLocationDot,
  faClock,
  faShieldHalved,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Get in touch with Gadget Malawi — questions, seller support, partnerships, and reports.',
};

const QUICK_LINKS = [
  {
    href: '/help',
    label: 'Help centre',
    hint: 'Guides for buying and selling safely.',
  },
  {
    href: '/trust',
    label: 'Trust & safety',
    hint: 'How we keep every deal secure.',
  },
  {
    href: '/report',
    label: 'Report a listing',
    hint: 'Flag a scam, prohibited item, or bad actor.',
  },
  {
    href: '/sell',
    label: 'Start selling',
    hint: 'List your first gadget in under a minute.',
  },
];

export default function ContactPage() {
  return (
    <div className="gm-stack" style={{ gap: 32 }}>
      {/* Hero */}
      <section className="gm-contact-hero">
        <span className="gm-eyebrow">We're listening</span>
        <h1 className="gm-display gm-contact-title">Get in touch.</h1>
        <p className="gm-contact-lead">
          Questions about buying, selling, partnerships, or a problem with an
          order — send us a message. Real people read every one.
        </p>
      </section>

      <div className="gm-contact-layout">
        {/* Left: channels */}
        <aside className="gm-contact-channels">
          <div className="gm-card gm-card-pad gm-contact-channel">
            <div className="gm-contact-channel-icon gm-contact-wa">
              <FontAwesomeIcon icon={faWhatsapp} />
            </div>
            <div className="gm-contact-channel-body">
              <strong>WhatsApp — fastest</strong>
              <span className="gm-small gm-muted">
                Usually replies within an hour, 8am–8pm.
              </span>
              <a
                href="https://wa.me/265992404606"
                target="_blank"
                rel="noopener noreferrer"
                className="gm-contact-link"
              >
                +265 992 404 606
                <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>
          </div>

          <div className="gm-card gm-card-pad gm-contact-channel">
            <div className="gm-contact-channel-icon gm-contact-email">
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <div className="gm-contact-channel-body">
              <strong>Email</strong>
              <span className="gm-small gm-muted">
                For formal enquiries and documentation.
              </span>
              <a
                href="mailto:hello@gadgetmalawi.mw"
                className="gm-contact-link"
              >
                hello@gadgetmalawi.mw
                <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>
          </div>

          <div className="gm-card gm-card-pad gm-contact-channel">
            <div className="gm-contact-channel-icon gm-contact-fb">
              <FontAwesomeIcon icon={faFacebookF} />
            </div>
            <div className="gm-contact-channel-body">
              <strong>Facebook</strong>
              <span className="gm-small gm-muted">
                Follow for new listings and announcements.
              </span>
              <a
                href="https://facebook.com/gadgetmalawi"
                target="_blank"
                rel="noopener noreferrer"
                className="gm-contact-link"
              >
                @gadgetmalawi
                <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>
          </div>

          <div className="gm-card gm-card-pad gm-contact-channel">
            <div className="gm-contact-channel-icon gm-contact-loc">
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <div className="gm-contact-channel-body">
              <strong>Based in</strong>
              <span className="gm-small gm-muted">
                Operating across Malawi.
              </span>
              <span className="gm-contact-static">
                Blantyre · Lilongwe · Mzuzu
              </span>
            </div>
          </div>

          <div className="gm-card gm-card-pad gm-contact-channel">
            <div className="gm-contact-channel-icon gm-contact-hours">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div className="gm-contact-channel-body">
              <strong>Support hours</strong>
              <span className="gm-small gm-muted">
                Monday to Saturday
              </span>
              <span className="gm-contact-static">8:00 AM — 8:00 PM</span>
            </div>
          </div>
        </aside>

        {/* Right: form + quick links */}
        <div className="gm-stack" style={{ gap: 24 }}>
          <div className="gm-card gm-card-pad">
            <div style={{ marginBottom: 18 }}>
              <h2 className="gm-section-title" style={{ fontSize: '1.2rem' }}>
                Send us a message
              </h2>
              <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
                We usually reply within one working day. For urgent issues,
                WhatsApp is faster.
              </p>
            </div>
            <ContactForm />
          </div>

          <div className="gm-card gm-card-pad">
            <div className="gm-contact-quick-head">
              <h2 className="gm-section-title" style={{ fontSize: '1.05rem' }}>
                Quick links
              </h2>
              <span className="gm-small gm-muted">
                Answers without waiting
              </span>
            </div>

            <div className="gm-contact-quick-grid">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="gm-contact-quick"
                >
                  <strong>{link.label}</strong>
                  <span>{link.hint}</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              ))}
            </div>
          </div>

          <div className="gm-contact-safety">
            <FontAwesomeIcon icon={faShieldHalved} />
            <div>
              <strong>Never share your PIN or password</strong>
              <span>
                Gadget Malawi staff will never ask for your Airtel Money PIN,
                TNM Mpamba PIN, or password. If someone does, it&apos;s a scam —
                report it immediately.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}