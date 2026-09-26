import Image from 'next/image';

type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Gadget Malawi logo.
 * Renders the production PNG icon (generated from the original artwork).
 * Kept as a component so we can swap the source in one place later.
 */
export function Logo({
  size = 34,
  className,
  title = 'Gadget Malawi',
}: LogoProps) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt={title}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: Math.round(size * 0.28), display: 'block' }}
      priority
    />
  );
}