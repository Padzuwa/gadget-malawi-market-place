'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function BrowseToolbar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') ?? 'newest';

  function updateSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="gm-market-toolbar">
      <p className="gm-small gm-muted" style={{ margin: 0 }}>
        <strong className="gm-text" style={{ color: 'var(--gm-text)' }}>
          {resultCount}
        </strong>{' '}
        {resultCount === 1 ? 'item' : 'items'} found
      </p>

      <label className="gm-row" style={{ gap: 8 }}>
        <span className="gm-small gm-muted">Sort by</span>
        <select
          className="gm-select"
          style={{ width: 'auto', minWidth: 180 }}
          value={currentSort}
          onChange={(e) => updateSort(e.target.value)}
          aria-label="Sort results"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}