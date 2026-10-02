'use client';

import { useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faSpinner,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { submitContact, type ContactSubject } from '@/app/contact/actions';

const SUBJECT_OPTIONS: { value: ContactSubject; label: string }[] = [
  { value: 'general', label: 'General question' },
  { value: 'support', label: 'Help with an order' },
  { value: 'report', label: 'Report a problem' },
  { value: 'seller', label: 'I want to sell on Gadget Malawi' },
  { value: 'partnership', label: 'Partnership or business' },
  { value: 'press', label: 'Press or media' },
  { value: 'other', label: 'Something else' },
];

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<ContactSubject>('general');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitContact({ name, email, subject, message });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="gm-contact-success">
        <div className="gm-contact-success-icon">
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <h2 className="gm-section-title" style={{ margin: 0 }}>
          Message received
        </h2>
        <p className="gm-muted" style={{ margin: 0, maxWidth: 380 }}>
          Thanks {name.split(' ')[0]}. We read every message and usually
          reply within one working day. If it&apos;s urgent, WhatsApp is
          fastest.
        </p>
        <a
          href="https://wa.me/265992404606"
          target="_blank"
          rel="noopener noreferrer"
          className="gm-btn gm-btn-primary"
        >
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="gm-contact-form">
      <div className="gm-form-grid">
        <div className="gm-field">
          <label className="gm-label" htmlFor="contact-name">
            Your name *
          </label>
          <input
            id="contact-name"
            className="gm-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Chikondi Banda"
          />
        </div>

        <div className="gm-field">
          <label className="gm-label" htmlFor="contact-email">
            Email *
          </label>
          <input
            id="contact-email"
            className="gm-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={200}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="contact-subject">
            What is this about? *
          </label>
          <select
            id="contact-subject"
            className="gm-select"
            value={subject}
            onChange={(e) => setSubject(e.target.value as ContactSubject)}
            required
          >
            {SUBJECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="contact-message">
            Your message *
          </label>
          <textarea
            id="contact-message"
            className="gm-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={10}
            maxLength={4000}
            rows={6}
            placeholder="Tell us what's going on. Include any order numbers or links if relevant."
          />
          <span className="gm-xs gm-subtle" style={{ marginTop: 4 }}>
            {message.length} / 4000
          </span>
        </div>
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

      <button
        type="submit"
        className="gm-btn gm-btn-primary gm-btn-block"
        disabled={pending || !name || !email || !message}
      >
        <FontAwesomeIcon
          icon={pending ? faSpinner : faPaperPlane}
          spin={pending}
        />
        {pending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}