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
  className?: string;
} & (
  | { kind?: 'product'; productId: string; conversationId?: never }
  | { kind: 'conversation'; conversationId: string; productId?: never }
);

const PRODUCT_REASONS: { value: ReportReason; label: string; hint: string }[] = [
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
  { value: 'other', label: 'Something else', hint: 'Tell us more below.' },
];

const CONVERSATION_REASONS: { value: ReportReason; label: string; hint: string }[] = [
  {
    value: 'scam',
    label: 'Scam or fraud',
    hint: 'Trying to get me to pay outside the platform.',
  },
  {
    value: 'harassment',
    label: 'Harassment or abuse',
    hint: 'Threats, insults, or offensive language.',
  },
  {
    value: 'off-platform',
    label: 'Pushing off-platform',
    hint: 'Repeatedly asking me to move to WhatsApp or pay elsewhere.',
  },
  {
    value: 'spam',
    label: 'Spam',
    hint: 'Promotional messages, unrelated to the listing.',
  },
  {
    value: 'offensive',
    label: 'Offensive content',
    hint: 'Inappropriate images or messages.',
  },
  { value: 'other', label: 'Something else', hint: 'Tell us more below.' },
];

function getReasons(kind: 'product' | 'conversation') {
  return kind === 'conversation' ? CONVERSATION_REASONS : PRODUCT_REASONS;
}

export function ReportButton(props: Props) {
  const { className } = props;
  const kind = props.kind ?? 'product';
  const reasons = getReasons(kind);

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

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
    window.setTimeout(reset, 200);
  }

  function handleSubmit() {
    if (!reason) {
      setError('Please pick a reason.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const result =
        kind === 'conversation'
          ? await submitReport({
              kind: 'conversation',
              conversationId: props.conversationId as string,
              reason,
              details: details.trim() || undefined,
            })
          : await submitReport({
              kind: 'product',
              productId: props.productId as string,
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

  const title =
    kind === 'conversation' ? 'Report this conversation' : 'Report this listing';
  const subtitle =
    kind === 'conversation'
      ? 'Your report is anonymous to the other party. We review every one.'
      : 'Your report is anonymous to the seller. We review every one.';

  return (
    <>
      <button
        type="button"
        className={className ?? 'gm-btn gm-btn-ghost gm-btn-sm'}
        onClick={() => setOpen(true)}
        aria-label={title}
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
                  {title}
                </h2>
                <p className="gm-report-sub">{subtitle}</p>
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
                <h3>Thanks — report received</h3>
                <p className="gm-small gm-muted">
                  Our team will review it shortly. If you keep seeing the same
                  behavior, report that too.
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
                  <p className="gm-report-label">Why are you reporting this?</p>

                  <div className="gm-report-reasons">
                    {reasons.map((option) => (
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