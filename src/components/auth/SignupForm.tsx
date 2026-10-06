'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';

type UserType = 'individual' | 'shop';

export function SignupForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('individual');
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
        data: {
          display_name: displayName.trim(),
          user_type: userType,
        },
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
      {/* User type */}
      <div className="gm-usertype-group">
        <p className="gm-usertype-label">How will you use Gadget Malawi?</p>
        <div className="gm-usertype-options">
          <label
            className={`gm-usertype-option${
              userType === 'individual' ? ' is-selected' : ''
            }`}
          >
            <input
              type="radio"
              name="user_type"
              value="individual"
              checked={userType === 'individual'}
              onChange={() => setUserType('individual')}
            />
            <span className="gm-usertype-body">
              <strong>Individual:</strong>
              <span> Buy and sell personal gadgets</span>
            </span>
          </label>
            <br />
          <label
            className={`gm-usertype-option${
              userType === 'shop' ? ' is-selected' : ''
            }`}
          >
            <input
              type="radio"
              name="user_type"
              value="shop"
              checked={userType === 'shop'}
              onChange={() => setUserType('shop')}
            />
            
            <span className="gm-usertype-body">
              <strong>Shop:</strong>
              <span> Sell from a physical shop or business</span>
            </span>
          </label>
        </div>

        {userType === 'shop' ? (
          <p
            className="gm-xs"
            style={{
              color: 'var(--gm-text-muted)',
              margin: '4px 0 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
            }}
          >
            <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            You can start listing immediately. Shop verification (National ID +
            shop photo) comes later and unlocks the verified badge.
          </p>
        ) : null}
      </div>

      {/* Name */}
      <div className="gm-field">
        <label className="gm-label" htmlFor="display_name">
          {userType === 'shop' ? 'Owner name' : 'Your name'}
        </label>
        <input
          id="display_name"
          className="gm-input"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={
            userType === 'shop' ? 'e.g. John Phiri' : 'e.g. Chikondi Banda'
          }
        />
      </div>

      {/* Email */}
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

      {/* Password */}
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
        <span className="gm-xs gm-subtle">Minimum 6 characters</span>
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

      <p
        className="gm-small gm-muted"
        style={{ margin: 0, textAlign: 'center' }}
      >
        Already have an account?{' '}
        <Link
          href="/login"
          style={{ color: 'var(--gm-brand)', fontWeight: 700 }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}