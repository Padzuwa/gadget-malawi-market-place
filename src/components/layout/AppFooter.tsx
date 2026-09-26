import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faWhatsapp,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import {
  faEnvelope,
  faLocationDot,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/brand/Logo';

const categories = [
  { label: 'Phones', href: '/browse?category=Phones' },
  { label: 'Laptops', href: '/browse?category=Laptops' },
  { label: 'PC Parts', href: '/browse?category=PC%20Parts' },
  { label: 'Storage', href: '/browse?category=Storage' },
  { label: 'Accessories', href: '/browse?category=Accessories' },
];

const companyLinks = [
  { label: 'About Gadget Malawi', href: '/about' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Sell on Gadget Malawi', href: '/sell' },
  { label: 'Contact us', href: '/contact' },
];

const supportLinks = [
  { label: 'Help centre', href: '/help' },
  { label: 'Trust & safety', href: '/trust' },
  { label: 'Buyer protection', href: '/buyer-protection' },
  { label: 'Report a listing', href: '/report' },
];

export function AppFooter() {
  return (
    <footer className="gm-footer">
      <div className="gm-footer-inner">
        <div className="gm-footer-grid">
          {/* Brand column */}
          <div className="gm-footer-brand">
            <Link href="/" className="gm-brand">
              <Logo size={40} />
              <span>Gadget Malawi</span>
            </Link>
            <p className="gm-footer-tagline">
              The trusted marketplace for gadgets and PC parts across Malawi.
              Verified sellers. Clear MWK prices. Secure mobile money payments.
            </p>
            <div className="gm-footer-social">
              <a
                href="#"
                className="gm-icon-btn"
                aria-label="Facebook"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a
                href="#"
                className="gm-icon-btn"
                aria-label="WhatsApp"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
              <a
                href="#"
                className="gm-icon-btn"
                aria-label="X (Twitter)"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
            </div>
          </div>

          {/* Browse */}
          <nav className="gm-footer-col" aria-label="Browse">
            <h3 className="gm-footer-heading">Browse</h3>
            <ul className="gm-footer-links">
              {categories.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav className="gm-footer-col" aria-label="Company">
            <h3 className="gm-footer-heading">Company</h3>
            <ul className="gm-footer-links">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav className="gm-footer-col" aria-label="Support">
            <h3 className="gm-footer-heading">Support</h3>
            <ul className="gm-footer-links">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="gm-footer-col">
            <h3 className="gm-footer-heading">Get in touch</h3>
            <ul className="gm-footer-links">
              <li>
                <a href="mailto:hello@gadgetmalawi.mw">
                  <FontAwesomeIcon icon={faEnvelope} /> hello@gadgetmalawi.mw
                </a>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faLocationDot} /> Blantyre · Lilongwe
                </span>
              </li>
              <li>
                <span>
                  <FontAwesomeIcon icon={faShieldHalved} /> Verified marketplace
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="gm-footer-bottom">
          <p className="gm-small gm-muted" style={{ margin: 0 }}>
            © {new Date().getFullYear()} Gadget Malawi. All rights reserved.
          </p>
          <div className="gm-footer-legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </div>
          <p className="gm-small gm-subtle" style={{ margin: 0 }}>
            Proudly built in Malawi
          </p>
        </div>
      </div>
    </footer>
  );
}