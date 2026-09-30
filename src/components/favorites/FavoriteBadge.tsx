'use client';

type Props = {
  initialCount: number;
};

export function FavoriteBadge({ initialCount }: Props) {
  if (initialCount <= 0) return null;

  return (
    <span className="gm-nav-badge" aria-label={`${initialCount} saved items`}>
      {initialCount > 99 ? '99+' : initialCount}
    </span>
  );
}