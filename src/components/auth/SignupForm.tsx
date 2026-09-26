'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="gm-stack" style={{ gap: 16 }}>
      <div className="gm-field">
        <label className="gm-label" htmlFor="display_name">
          Your name
        </label>
        <input
          id="display_name"
          className="gm-input"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Chikondi Banda"
        />
      </div>

      <div className="gm-field">
        <label className="gm-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="gm-input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="gm-field">
        <label className="gm-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          className="gm-input"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
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

      <button
        type="submit"
        className="gm-btn gm-btn-primary gm-btn-block"
        disabled={loading}
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="gm-small gm-muted" style={{ margin: 0, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--gm-brand)', fontWeight: 700 }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}