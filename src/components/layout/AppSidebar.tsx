'use client';

import { FavoriteBadge } from '@/components/favorites/FavoriteBadge';
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
  faCartShopping,
  faBox,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/brand/Logo';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import { CartBadge } from '@/components/cart/CartBadge';
import link from 'next/link';
const primaryLinks = [
  { href: '/', label: 'Home', icon: faHouse },
  { href: '/browse', label: 'Browse', icon: faMagnifyingGlass },
  { href: '/cart', label: 'Cart', icon: faCartShopping, badgeKey: 'cart' },
  { href: '/messages', label: 'Messages', icon: faMessage, badgeKey: 'messages' },
  { href: '/favorites', label: 'Favorites', icon: faHeart, badgeKey: 'favorites' },
] as const;

const accountLinks = [
  { href: '/orders', label: 'My orders', icon: faBoxOpen },
  { href: '/dashboard', label: 'My dashboard', icon: faStore },
  { href: '/profile', label: 'My profile', icon: faUser },
] as const;

export function AppSidebar({
  unreadCount,
  favoriteCount,
}: {
  unreadCount: number;
  favoriteCount: number;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }
{'badgeKey' in link && link.badgeKey === 'messages' ? (
  <UnreadBadge initialCount={unreadCount} />
) : null}
{'badgeKey' in link && link.badgeKey === 'cart' ? <CartBadge /> : null}
{'badgeKey' in link && link.badgeKey === 'favorites' ? (
  <FavoriteBadge initialCount={favoriteCount} />
) : null}
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