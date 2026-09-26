'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faXmark,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import type { ProductCondition } from '@/lib/types';

type FilterBarProps = {
  categories: string[];
  locations: string[];
  resultCount: number;
};

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'used', label: 'Used' },
];

type DropdownId = 'category' | 'location' | 'condition' | 'price' | 'sort' | null;

export function FilterBar({
  categories,
  locations,
  resultCount,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<DropdownId>(null);

  const currentCategory = searchParams.get('category') ?? '';
  const currentLocation = searchParams.get('location') ?? '';
  const currentConditions =
    searchParams.get('condition')?.split(',').filter(Boolean) ?? [];
  const currentMin = searchParams.get('min') ?? '';
  const currentMax = searchParams.get('max') ?? '';
  const currentSort = searchParams.get('sort') ?? 'newest';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(null);
  }

  function toggleCondition(value: ProductCondition) {
    const next = currentConditions.includes(value)
      ? currentConditions.filter((c) => c !== value)
      : [...currentConditions, value];
    updateParam('condition', next.length ? next.join(',') : null);
  }

  function clearAll() {
    router.push(pathname);
    setOpen(null);
  }

  const activeCount =
    (currentCategory ? 1 : 0) +
    (currentLocation ? 1 : 0) +
    (currentConditions.length ? 1 : 0) +
    (currentMin || currentMax ? 1 : 0);

  const sortLabel =
    currentSort === 'price-asc'
      ? 'Price: low to high'
      : currentSort === 'price-desc'
      ? 'Price: high to low'
      : 'Newest first';

  return (
    <div className="gm-filter-bar" ref={barRef}>
      <div className="gm-filter-bar-triggers">
        {/* Category */}
        <div className="gm-filter-trigger-wrap">
          <button
            type="button"
            className={`gm-filter-trigger${currentCategory ? ' is-active' : ''}`}
            onClick={() => setOpen(open === 'category' ? null : 'category')}
            aria-expanded={open === 'category'}
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

        {/* Location */}
        <div className="gm-filter-trigger-wrap">
          <button
            type="button"
            className={`gm-filter-trigger${currentLocation ? ' is-active' : ''}`}
            onClick={() => setOpen(open === 'location' ? null : 'location')}
            aria-expanded={open === 'location'}
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

        {/* Condition */}
        <div className="gm-filter-trigger-wrap">
          <button
            type="button"
            className={`gm-filter-trigger${currentConditions.length ? ' is-active' : ''}`}
            onClick={() => setOpen(open === 'condition' ? null : 'condition')}
            aria-expanded={open === 'condition'}
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

        {/* Price */}
        <div className="gm-filter-trigger-wrap">
          <button
            type="button"
            className={`gm-filter-trigger${currentMin || currentMax ? ' is-active' : ''}`}
            onClick={() => setOpen(open === 'price' ? null : 'price')}
            aria-expanded={open === 'price'}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateParam('min', (e.target as HTMLInputElement).value || null);
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateParam('max', (e.target as HTMLInputElement).value || null);
                    }
                  }}
                  placeholder="Any"
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Sort */}
        <div className="gm-filter-trigger-wrap">
          <button
            type="button"
            className="gm-filter-trigger"
            onClick={() => setOpen(open === 'sort' ? null : 'sort')}
            aria-expanded={open === 'sort'}
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

        {activeCount > 0 ? (
          <button
            type="button"
            className="gm-filter-clear"
            onClick={clearAll}
          >
            <FontAwesomeIcon icon={faXmark} />
            Clear
          </button>
        ) : null}
      </div>

      <span className="gm-filter-count gm-small gm-muted">
        <FontAwesomeIcon icon={faFilter} />
        {resultCount} {resultCount === 1 ? 'item' : 'items'}
      </span>
    </div>
  );
}