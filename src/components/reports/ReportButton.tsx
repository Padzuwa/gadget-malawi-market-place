'use client';

import { useEffect, useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlag,
  faXmark,
  faCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { submitReport, type ReportReason } from '@/app/reports/actions';

type Props = {
  productId: string;
  className?: string;
};

const REASON_OPTIONS: { value: ReportReason; label: string; hint: string }[] = [
  {
    value: 'scam',
    label: 'Scam or fraud',
    hint: 'Seller is asking for money without intending to deliver.',
  },
  {
    value: 'stolen',
    label: 'Stolen goods',
    hint: 'Item looks like it was stolen from someone.',
  },
  {
    value: 'counterfeit',
    label: 'Counterfeit or fake',
    hint: 'Not a genuine product, or copied brand.',
  },
  {
    value: 'wrong-category',
    label: 'Wrong category',
    hint: 'Listed in a category that does not match.',
  },
  {
    value: 'offensive',
    label: 'Offensive content',
    hint: 'Includes offensive images, text, or language.',
  },
  {
    value: 'spam',
    label: 'Spam or duplicate',
    hint: 'Same item posted many times, or promotional spam.',
  },
  {
    value: 'prohibited',
    label: 'Item not allowed',
    hint: 'Does not belong on this marketplace.',
  },
  {
    value: 'other',
    label: 'Something else',
    hint: 'Tell us more below.',
  },
];

export function ReportButton({ productId, className }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  // Lock body scroll + escape-to-close while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function reset() {
    setReason(null);
    setDetails('');
    setError(null);
    setSubmitted(false);
  }

  function close() {
    setOpen(false);
    // Delay reset so the closing animation doesn't flicker
    window.setTimeout(reset, 200);
  }

  function handleSubmit() {
    if (!reason) {
      setError('Please pick a reason.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await submitReport({
        productId,
        reason,
        details: details.trim() || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <>
      <button
        type="button"
        className={className ?? 'gm-btn gm-btn-ghost gm-btn-sm'}
        onClick={() => setOpen(true)}
        aria-label="Report this listing"
      >
        <FontAwesomeIcon icon={faFlag} />
        Report
      </button>

      {open ? (
        <div
          className="gm-report-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >
          <div className="gm-report-modal gm-card">
            <header className="gm-report-header">
              <div>
                <h2 id="report-title" className="gm-report-title">
                  Report this listing
                </h2>
                <p className="gm-report-sub">
                  Your report is anonymous to the seller. Only Gadget Mw Team reviews the reports.
                </p>
              </div>
              <button
                type="button"
                className="gm-icon-btn"
                onClick={close}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </header>

            {submitted ? (
              <div className="gm-report-success">
                <div className="gm-report-success-icon">
                  <FontAwesomeIcon icon={faCheck} />
                </div>
                <h3>Thanks, Your report has been received</h3>
                <p className="gm-small gm-muted">
                  Our team will review it shortly. If you see the same
                  listing from another account, report that one too.
                </p>
                <button
                  type="button"
                  className="gm-btn gm-btn-primary"
                  onClick={close}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="gm-report-body">
                  <p className="gm-report-label">Why are you reporting it?</p>

                  <div className="gm-report-reasons">
                    {REASON_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`gm-report-reason${
                          reason === option.value ? ' is-selected' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="report-reason"
                          value={option.value}
                          checked={reason === option.value}
                          onChange={() => setReason(option.value)}
                        />
                        <span className="gm-report-reason-body">
                          <strong>{option.label}</strong>
                          <span>{option.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="gm-field" style={{ marginTop: 16 }}>
                    <label className="gm-label" htmlFor="report-details">
                      More details{' '}
                      <span className="gm-muted">(optional)</span>
                    </label>
                    <textarea
                      id="report-details"
                      className="gm-textarea"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      maxLength={1000}
                      placeholder="Anything that helps us understand the issue…"
                    />
                    <span className="gm-xs gm-subtle" style={{ marginTop: 4 }}>
                      {details.length} / 1000
                    </span>
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
                    onClick={close}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-primary"
                    onClick={handleSubmit}
                    disabled={pending || !reason}
                  >
                    <FontAwesomeIcon
                      icon={pending ? faSpinner : faFlag}
                      spin={pending}
                    />
                    {pending ? 'Submitting…' : 'Submit report'}
                  </button>
                </footer>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}