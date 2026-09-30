'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toggleFavorite } from '@/app/favorites/actions';

type Props = {
  productId: string;
  initialFavorited: boolean;
  variant?: 'icon' | 'block';
};

export function FavoriteButton({
  productId,
  initialFavorited,
  variant = 'icon',
}: Props) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      const result = await toggleFavorite(productId);

      if (!result.ok) {
        setFavorited(!next); // roll back
        setError(result.error);

        // Detect auth failure by message — the only case we redirect for.
        // (If we add error codes later, swap this for a code check.)
        if (result.error.toLowerCase().includes('signed in')) {
          router.push('/login?next=/favorites');
        }
        return;
      }

      setFavorited(result.favorited);
    });
  }

  if (variant === 'block') {
    return (
      <div className="gm-fav-block">
        <button
          type="button"
          className={`gm-btn gm-btn-block ${
            favorited ? 'gm-btn-accent' : 'gm-btn-secondary'
          }`}
          onClick={handleClick}
          disabled={pending}
          aria-pressed={favorited}
        >
          <FontAwesomeIcon icon={pending ? faSpinner : faHeart} spin={pending} />
          {favorited ? 'Saved' : 'Save for later'}
        </button>
        {error ? (
          <p className="gm-xs" style={{ color: 'var(--gm-danger)', margin: 0 }}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="gm-fav-wrap">
      <button
        type="button"
        className={`gm-icon-btn gm-product-fav${
          favorited ? ' is-favorite' : ''
        }`}
        onClick={handleClick}
        disabled={pending}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <FontAwesomeIcon icon={pending ? faSpinner : faHeart} spin={pending} />
      </button>
      {error ? (
        <span className="gm-fav-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}