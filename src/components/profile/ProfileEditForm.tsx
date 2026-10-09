'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { updateProfile } from '@/app/profile/actions';
import type { OwnProfile } from '@/lib/data/profiles';

type Location = { id: string; name: string };

type Props = {
  profile: OwnProfile;
  locations: Location[];
};

export function ProfileEditForm({ profile, locations }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [locationId, setLocationId] = useState(profile.locationId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const usernameChanged =
    (profile.username ?? '') !== username.trim().toLowerCase();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        username,
        bio,
        phone,
        locationId: locationId || null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2200);
    });
  }

  return (
    <form onSubmit={onSubmit} className="gm-stack" style={{ gap: 16 }}>
      <div className="gm-form-grid">
        <div className="gm-field">
          <label className="gm-label" htmlFor="display_name">
            Display name *
          </label>
          <input
            id="display_name"
            className="gm-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={60}
          />
        </div>

        <div className="gm-field">
          <label className="gm-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="gm-input"
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
              )
            }
            maxLength={30}
            placeholder="your_username"
          />
          <span className="gm-xs gm-subtle">
            {usernameChanged && profile.username
              ? 'You can only change this once every 30 days.'
              : 'Your public link: /profile/' + (username || 'username')}
          </span>
        </div>

        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="gm-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Tell buyers about you or your shop."
          />
          <span className="gm-xs gm-subtle">{bio.length} / 300</span>
        </div>

        <div className="gm-field">
          <label className="gm-label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            className="gm-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+265 9XX XXX XXX"
            maxLength={20}
          />
          <span className="gm-xs gm-subtle">
            Only shared with buyers after an order.
          </span>
        </div>

        <div className="gm-field">
          <label className="gm-label" htmlFor="location">
            Location
          </label>
          <select
            id="location"
            className="gm-select"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            <option value="">Not set</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
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

      <div className="gm-row" style={{ justifyContent: 'flex-end', gap: 10 }}>
        {saved ? (
          <span
            className="gm-small"
            style={{
              color: 'var(--gm-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <FontAwesomeIcon icon={faCheck} /> Saved
          </span>
        ) : null}

        <button
          type="submit"
          className="gm-btn gm-btn-primary"
          disabled={pending}
        >
          {pending ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </form>
  );
}