'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faHeart,
  faMessage,
  faUser,
  faStore,
  faPlus,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/brand/Logo';
import { UnreadBadge } from '@/components/chat/UnreadBadge';

const primaryLinks = [
  { href: '/', label: 'Home', icon: faHouse },
  { href: '/browse', label: 'Browse', icon: faMagnifyingGlass },
  { href: '/messages', label: 'Messages', icon: faMessage, badgeKey: 'messages' },
  { href: '/favorites', label: 'Favorites', icon: faHeart },
] as const;

const accountLinks = [
  { href: '/dashboard', label: 'My dashboard', icon: faStore },
  { href: '/profile', label: 'My profile', icon: faUser },
] as const;

export function AppSidebar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <aside className="gm-sidebar">
      <Link href="/" className="gm-brand">
        <Logo size={34} />
        <span>Gadget Malawi</span>
      </Link>

      <nav className="gm-sidebar-nav" aria-label="Primary">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`gm-nav-link${isActive(link.href) ? ' is-active' : ''}`}
          >
            <FontAwesomeIcon icon={link.icon} />
            <span>{link.label}</span>
            {'badgeKey' in link && link.badgeKey === 'messages' ? (
              <UnreadBadge initialCount={unreadCount} />
            ) : null}
          </Link>
        ))}
      </nav>

      <Link
        href="/sell"
        className={`gm-nav-link is-sell gm-sidebar-cta${isActive('/sell') ? ' is-active' : ''}`}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Sell a gadget</span>
      </Link>

      <p className="gm-sidebar-label">Account</p>
      <nav className="gm-sidebar-nav" aria-label="Account">
        {accountLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`gm-nav-link${isActive(link.href) ? ' is-active' : ''}`}
          >
            <FontAwesomeIcon icon={link.icon} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="gm-sidebar-footer">
        <FontAwesomeIcon icon={faShieldHalved} /> Verified marketplace
      </div>
    </aside>
  );
}