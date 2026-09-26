'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faPlus,
  faMessage,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { UnreadBadge } from '@/components/chat/UnreadBadge';

const links = [
  { href: '/', label: 'Home', icon: faHouse },
  { href: '/browse', label: 'Search', icon: faMagnifyingGlass },
  { href: '/sell', label: 'Sell', icon: faPlus, isSell: true },
  { href: '/messages', label: 'Messages', icon: faMessage, badgeKey: 'messages' },
  { href: '/profile', label: 'Profile', icon: faUser },
] as const;

export function MobileNav({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className="gm-mobile-nav" aria-label="Primary">
      {links.map((link) => {
        const active = isActive(link.href);

        if ('isSell' in link && link.isSell) {
          return (
            <Link key={link.href} href={link.href} aria-label={link.label}>
              <span className="gm-mobile-sell">
                <FontAwesomeIcon icon={link.icon} />
              </span>
              <span>{link.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? 'is-active' : ''}
            aria-current={active ? 'page' : undefined}
          >
            <span className="gm-mobile-nav-icon">
              <FontAwesomeIcon icon={link.icon} />
              {'badgeKey' in link && link.badgeKey === 'messages' ? (
                <UnreadBadge initialCount={unreadCount} />
              ) : null}
            </span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}