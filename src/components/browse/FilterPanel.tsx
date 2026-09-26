'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { ProductCondition } from '@/lib/types';

type FilterPanelProps = {
  categories: string[];
  locations: string[];
};

const conditionOptions: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'used', label: 'Used' },
];

export function FilterPanel({ categories, locations }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') ?? '';
  const currentLocation = searchParams.get('location') ?? '';
  const currentConditions =
    searchParams.get('condition')?.split(',').filter(Boolean) ?? [];
  const currentMin = searchParams.get('min') ?? '';
  const currentMax = searchParams.get('max') ?? '';

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleCondition(value: ProductCondition) {
    const next = currentConditions.includes(value)
      ? currentConditions.filter((c) => c !== value)
      : [...currentConditions, value];
    updateParam('condition', next.length ? next.join(',') : null);
  }

  function clearAll() {
    router.push(pathname);
  }

  const hasFilters =
    currentCategory ||
    currentLocation ||
    currentConditions.length ||
    currentMin ||
    currentMax;

  return (
    <aside className="gm-card gm-card-pad gm-filter-panel">
      <div className="gm-between" style={{ marginBottom: 4 }}>
        <strong className="gm-filter-title">Filters</strong>
        {hasFilters ? (
          <button
            type="button"
            className="gm-btn gm-btn-ghost gm-btn-sm"
            onClick={clearAll}
          >
            <FontAwesomeIcon icon={faXmark} />
            Clear
          </button>
        ) : null}
      </div>

      {/* Category */}
      <div className="gm-filter-group" style={{ marginTop: 16 }}>
        <label className="gm-filter-title" htmlFor="filter-category">
          Category
        </label>
        <select
          id="filter-category"
          className="gm-select"
          value={currentCategory}
          onChange={(e) => updateParam('category', e.target.value || null)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="gm-filter-group">
        <label className="gm-filter-title" htmlFor="filter-location">
          Location
        </label>
        <select
          id="filter-location"
          className="gm-select"
          value={currentLocation}
          onChange={(e) => updateParam('location', e.target.value || null)}
        >
          <option value="">All of Malawi</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="gm-filter-group">
        <span className="gm-filter-title">Price range (MWK)</span>
        <div className="gm-row" style={{ gap: 8 }}>
          <input
            type="number"
            className="gm-input"
            placeholder="Min"
            inputMode="numeric"
            value={currentMin}
            onChange={(e) => updateParam('min', e.target.value || null)}
            aria-label="Minimum price"
          />
          <input
            type="number"
            className="gm-input"
            placeholder="Max"
            inputMode="numeric"
            value={currentMax}
            onChange={(e) => updateParam('max', e.target.value || null)}
            aria-label="Maximum price"
          />
        </div>
      </div>

      {/* Condition */}
      <div className="gm-filter-group">
        <span className="gm-filter-title">Condition</span>
        {conditionOptions.map((option) => (
          <label key={option.value} className="gm-filter-option">
            <input
              type="checkbox"
              checked={currentConditions.includes(option.value)}
              onChange={() => toggleCondition(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </aside>
  );
}