'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faArrowLeft,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Mobile-only search. Renders a small icon button in the header.
 * Tapping it reveals a full-width search bar overlay. Auto-focuses
 * the input, escape closes, backdrop click closes.
 */
export function MobileSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : '/browse'
    );
    setOpen(false);
    setQuery('');
  }

  function close() {
    setOpen(false);
    setQuery('');
  }

  return (
    <>
      <button
        type="button"
        className="gm-icon-btn gm-mobile-search-btn"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>

      {open ? (
        <div className="gm-mobile-search-overlay" role="dialog" aria-modal="true">
          <form onSubmit={submit} className="gm-mobile-search-bar">
            <button
              type="button"
              onClick={close}
              className="gm-mobile-search-back"
              aria-label="Close search"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gadgets, parts, brands…"
              className="gm-mobile-search-input"
              aria-label="Search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="gm-mobile-search-clear"
                aria-label="Clear"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            ) : null}

            <button
              type="submit"
              className="gm-mobile-search-submit"
              aria-label="Submit search"
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>

          <div
            className="gm-mobile-search-backdrop"
            onClick={close}
            aria-hidden="true"
          />
        </div>
      ) : null}
    </>
  );
}