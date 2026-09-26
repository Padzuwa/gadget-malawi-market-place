'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="gm-stack" style={{ gap: 16 }}>
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
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
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="gm-small gm-muted" style={{ margin: 0, textAlign: 'center' }}>
        New to Gadget Malawi?{' '}
        <Link href="/signup" style={{ color: 'var(--gm-brand)', fontWeight: 700 }}>
          Create an account
        </Link>
      </p>
    </form>
  );
}