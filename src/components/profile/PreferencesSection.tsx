'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faDesktop } from '@fortawesome/free-solid-svg-icons';

type Theme = 'dark' | 'light' | 'system';

const OPTIONS: { value: Theme; label: string; icon: typeof faMoon }[] = [
  { value: 'dark', label: 'Dark', icon: faMoon },
  { value: 'light', label: 'Light', icon: faSun },
  { value: 'system', label: 'System', icon: faDesktop },
];

export function PreferencesSection() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('gadget-malawi-theme');
    if (stored === 'dark' || stored === 'light') setTheme(stored);
    else setTheme('system');
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    let resolved: 'dark' | 'light';
    if (next === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
      window.localStorage.removeItem('gadget-malawi-theme');
    } else {
      resolved = next;
      window.localStorage.setItem('gadget-malawi-theme', next);
    }
    document.documentElement.dataset.theme = resolved;
  }

  return (
    <div className="gm-theme-options">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`gm-theme-option${
            theme === opt.value ? ' is-selected' : ''
          }`}
          onClick={() => choose(opt.value)}
          aria-pressed={theme === opt.value}
        >
          <FontAwesomeIcon icon={opt.icon} />
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}