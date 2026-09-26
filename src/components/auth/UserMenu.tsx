'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faRightFromBracket,
  faStore,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <span
        className="gm-icon-btn"
        style={{ opacity: 0.4, pointerEvents: 'none' }}
        aria-hidden
      >
        <FontAwesomeIcon icon={faUser} />
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="gm-btn gm-btn-secondary gm-btn-sm"
        style={{ whiteSpace: 'nowrap' }}
      >
        Sign in
      </Link>
    );
  }

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Account';

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="gm-user-menu" ref={menuRef}>
      <button
        type="button"
        className="gm-icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="gm-avatar" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
          {initial}
        </span>
      </button>

      {open ? (
        <div className="gm-user-menu-panel gm-card">
          <div className="gm-user-menu-header">
            <strong className="gm-small" style={{ display: 'block' }}>
              {displayName}
            </strong>
            <span className="gm-xs gm-subtle">{user.email}</span>
          </div>
          <div className="gm-user-menu-links">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faStore} /> My dashboard
            </Link>
            <Link href="/profile" onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faUser} /> My profile
            </Link>
            <Link href="/settings" onClick={() => setOpen(false)}>
              <FontAwesomeIcon icon={faGear} /> Settings
            </Link>
            <button type="button" onClick={handleSignOut}>
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}