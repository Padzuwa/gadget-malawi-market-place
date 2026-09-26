'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faBell, faPlus } from '@fortawesome/free-solid-svg-icons';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from '@/components/brand/Logo';
import { UserMenu } from '@/components/auth/UserMenu';

export function AppHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : '/browse');
  }

  return (
    <header className="gm-header">
      <div className="gm-header-left">
        <Link href="/" className="gm-brand gm-header-brand">
          <Logo size={34} />
          <span>Gadget Malawi</span>
        </Link>

        <form onSubmit={onSubmit} className="gm-search gm-header-search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <input
            type="search"
            placeholder="Search gadgets, parts, brands..."
            aria-label="Search gadgets"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="gm-header-right">
        <Link href="/sell" className="gm-btn gm-btn-primary gm-btn-sm">
          <FontAwesomeIcon icon={faPlus} />
          <span>Sell</span>
        </Link>

        <ThemeToggle />

        <button type="button" className="gm-icon-btn" aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}