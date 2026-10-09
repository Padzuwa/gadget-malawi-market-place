'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightFromBracket,
  faTrash,
  faSpinner,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';
import { deleteAccount } from '@/app/profile/actions';

export function AccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(confirmText);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="gm-stack" style={{ gap: 16 }}>
      <div className="gm-account-row">
        <div>
          <strong className="gm-small" style={{ display: 'block' }}>
            Email
          </strong>
          <span className="gm-small gm-muted">{email}</span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-secondary gm-btn-sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Signing out…
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
            </>
          )}
        </button>
      </div>

      <div className="gm-danger-zone">
        <div>
          <strong className="gm-small">Delete account</strong>
          <p className="gm-xs gm-muted" style={{ margin: '4px 0 0' }}>
            Your listings are removed and your profile is hidden. Past orders
            are kept for records. This cannot be undone.
          </p>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-sm gm-btn-danger"
          onClick={() => setDeleteOpen(true)}
        >
          <FontAwesomeIcon icon={faTrash} /> Delete
        </button>
      </div>

      {deleteOpen ? (
        <div
          className="gm-report-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="gm-report-modal gm-card">
            <header className="gm-report-header">
              <div>
                <h2 className="gm-report-title">Delete your account?</h2>
                <p className="gm-report-sub">
                  This action cannot be undone. Your listings will be
                  archived and your profile hidden.
                </p>
              </div>
              <button
                type="button"
                className="gm-icon-btn"
                onClick={() => setDeleteOpen(false)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>

            <div className="gm-report-body">
              <div className="gm-field">
                <label className="gm-label" htmlFor="confirm_delete">
                  Type <strong>delete my account</strong> to confirm
                </label>
                <input
                  id="confirm_delete"
                  className="gm-input"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  placeholder="delete my account"
                />
              </div>

              {error ? (
                <p
                  className="gm-small"
                  style={{ color: 'var(--gm-danger)', margin: 0 }}
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </div>

            <footer className="gm-report-footer">
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setDeleteOpen(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                style={{
                  background: 'var(--gm-danger)',
                  borderColor: 'var(--gm-danger)',
                }}
                onClick={handleDelete}
                disabled={pending || confirmText.trim().length === 0}
              >
                {pending ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Deleting…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} /> Delete account
                  </>
                )}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}