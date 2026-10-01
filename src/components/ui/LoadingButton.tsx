'use client';

import { useTransition, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** When true, shows the spinner, replaces children with loadingText, and disables the button. */
  loading?: boolean;
  /** Text shown while loading. Falls back to the original children if omitted. */
  loadingText?: string;
  children: ReactNode;
};

/**
 * Button that:
 *  - Shows a spinner while loading
 *  - Replaces its label with `loadingText` (or keeps the label)
 *  - Disables itself while loading → prevents double-clicks
 *
 * Drop-in replacement for <button>. Pass `loading={pending}` from useTransition.
 */
export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled || loading}
      className={`${className ?? ''}${loading ? ' is-loading' : ''}`.trim()}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <FontAwesomeIcon icon={faSpinner} spin />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
  const [pending, startTransition] = useTransition();

<LoadingButton
  type="submit"
  loading={pending}
  loadingText="Saving…"
  className="gm-btn gm-btn-primary"
>
  Save changes
</LoadingButton>
}