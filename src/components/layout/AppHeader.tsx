'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faBell,
  faPlus,
  faChevronDown,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from '@/components/brand/Logo';
import { UserMenu } from '@/components/auth/UserMenu';
import { createClient } from '@/lib/supabase/client';
import type { ProductCondition } from '@/lib/types';

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'used', label: 'Used' },
];

type DropdownId = 'category' | 'location' | 'condition' | 'price' | 'sort' | null;

/**
 * Public wrapper — provides a Suspense boundary so useSearchParams()
 * doesn't break static prerendering of /_not-found and other pages.
 */
export function AppHeader() {
  return (
    <Suspense fallback={<AppHeaderSkeleton />}>
      <AppHeaderInner />
    </Suspense>
  );
}

/**
 * Fallback shown during prerender and while the client hydrates.
 * Matches the real header height so nothing shifts on load.
 */
function AppHeaderSkeleton() {
  return (
    <header className="gm-header">
      <div className="gm-header-main" style={{ minHeight: 44 }} />
    </header>
  );
}

function AppHeaderInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [open, setOpen] = useState<DropdownId>(null);

  const isBrowse = pathname.startsWith('/browse');

  useEffect(() => {
    if (!isBrowse) return;
    const supabase = createClient();
    Promise.all([
      supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('locations')
        .select('name')
        .eq('is_active', true)
        .order('sort_order'),
    ]).then(([c, l]) => {
      if (c.data) setCategories(c.data.map((r) => r.name as string));
      if (l.data) setLocations(l.data.map((r) => r.name as string));
    });
  }, [isBrowse]);

  useEffect(() => {
    setOpen(null);
  }, [pathname, searchParams]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : '/browse');
  }

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
    setOpen(null);
  }

  function toggleCondition(value: ProductCondition) {
    const current = searchParams.get('condition')?.split(',').filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((c) => c !== value)
      : [...current, value];
    updateParam('condition', next.length ? next.join(',') : null);
  }

  function clearAll() {
    router.push('/browse');
    setOpen(null);
  }

  const currentCategory = searchParams.get('category') ?? '';
  const currentLocation = searchParams.get('location') ?? '';
  const currentConditions =
    searchParams.get('condition')?.split(',').filter(Boolean) ?? [];
  const currentMin = searchParams.get('min') ?? '';
  const currentMax = searchParams.get('max') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';

  const sortLabel =
    currentSort === 'price-asc'
      ? 'Price: low to high'
      : currentSort === 'price-desc'
      ? 'Price: high to low'
      : 'Newest first';

  const hasAnyFilter =
    !!currentCategory ||
    !!currentLocation ||
    currentConditions.length > 0 ||
    !!currentMin ||
    !!currentMax;

  return (
    <header className={`gm-header${isBrowse ? ' gm-header-with-filters' : ''}`}>
      <div className="gm-header-main">
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
      </div>

      {isBrowse ? (
        <div className="gm-header-filters">
          <div className="gm-filter-trigger-wrap">
            <button
              type="button"
              className={`gm-filter-trigger${currentCategory ? ' is-active' : ''}`}
              onClick={() => setOpen(open === 'category' ? null : 'category')}
            >
              {currentCategory || 'All categories'}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {open === 'category' ? (
              <div className="gm-filter-dropdown gm-card">
                <button
                  type="button"
                  className={`gm-filter-option${!currentCategory ? ' is-selected' : ''}`}
                  onClick={() => updateParam('category', null)}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`gm-filter-option${currentCategory === c ? ' is-selected' : ''}`}
                    onClick={() => updateParam('category', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="gm-filter-trigger-wrap">
            <button
              type="button"
              className={`gm-filter-trigger${currentLocation ? ' is-active' : ''}`}
              onClick={() => setOpen(open === 'location' ? null : 'location')}
            >
              {currentLocation || 'All locations'}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {open === 'location' ? (
              <div className="gm-filter-dropdown gm-card">
                <button
                  type="button"
                  className={`gm-filter-option${!currentLocation ? ' is-selected' : ''}`}
                  onClick={() => updateParam('location', null)}
                >
                  All locations
                </button>
                {locations.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`gm-filter-option${currentLocation === l ? ' is-selected' : ''}`}
                    onClick={() => updateParam('location', l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="gm-filter-trigger-wrap">
            <button
              type="button"
              className={`gm-filter-trigger${currentConditions.length ? ' is-active' : ''}`}
              onClick={() => setOpen(open === 'condition' ? null : 'condition')}
            >
              {currentConditions.length
                ? `Condition: ${currentConditions.length}`
                : 'Any condition'}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {open === 'condition' ? (
              <div className="gm-filter-dropdown gm-card">
                {conditionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`gm-filter-option${currentConditions.includes(option.value) ? ' is-selected' : ''}`}
                    onClick={() => toggleCondition(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="gm-filter-trigger-wrap">
            <button
              type="button"
              className={`gm-filter-trigger${currentMin || currentMax ? ' is-active' : ''}`}
              onClick={() => setOpen(open === 'price' ? null : 'price')}
            >
              {currentMin || currentMax ? 'Price set' : 'Any price'}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {open === 'price' ? (
              <div className="gm-filter-dropdown gm-card gm-filter-dropdown-price">
                <div className="gm-field">
                  <label className="gm-label">Min (MWK)</label>
                  <input
                    type="number"
                    className="gm-input"
                    defaultValue={currentMin}
                    onBlur={(e) => updateParam('min', e.target.value || null)}
                    placeholder="0"
                  />
                </div>
                <div className="gm-field">
                  <label className="gm-label">Max (MWK)</label>
                  <input
                    type="number"
                    className="gm-input"
                    defaultValue={currentMax}
                    onBlur={(e) => updateParam('max', e.target.value || null)}
                    placeholder="Any"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="gm-filter-trigger-wrap">
            <button
              type="button"
              className="gm-filter-trigger"
              onClick={() => setOpen(open === 'sort' ? null : 'sort')}
            >
              {sortLabel}
              <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {open === 'sort' ? (
              <div className="gm-filter-dropdown gm-card">
                {[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'price-asc', label: 'Price: low to high' },
                  { value: 'price-desc', label: 'Price: high to low' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`gm-filter-option${currentSort === option.value ? ' is-selected' : ''}`}
                    onClick={() =>
                      updateParam('sort', option.value === 'newest' ? null : option.value)
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {hasAnyFilter ? (
            <button type="button" className="gm-filter-clear" onClick={clearAll}>
              <FontAwesomeIcon icon={faXmark} />
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}