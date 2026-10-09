'use client';

import { useRef, useState, useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { uploadAvatar } from '@/lib/supabase/storage';
import { updateAvatarUrl } from '@/app/profile/actions';

type Props = {
  currentUrl: string | null;
  displayName: string;
  size?: number;
};

export function AvatarUpload({ currentUrl, displayName, size = 96 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = preview || currentUrl;
  const initial = displayName.charAt(0).toUpperCase() || '?';

  function onClick() {
    if (pending) return;
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    startTransition(async () => {
      try {
        const uploaded = await uploadAvatar(file);
        const result = await updateAvatarUrl(uploaded.url);
        if (!result.ok) {
          setError(result.error);
          setPreview(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed.');
        setPreview(null);
      }
    });

    e.target.value = '';
  }

  return (
    <div className="gm-avatar-upload">
      <button
        type="button"
        className="gm-avatar-upload-button"
        style={{ width: size, height: size }}
        onClick={onClick}
        disabled={pending}
        aria-label="Change profile photo"
      >
        {shown ? (
          <img src={shown} alt={displayName} />
        ) : (
          <span className="gm-avatar-upload-initial">{initial}</span>
        )}
        <span className="gm-avatar-upload-overlay">
          <FontAwesomeIcon
            icon={pending ? faSpinner : faCamera}
            spin={pending}
          />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />

      {error ? (
        <p className="gm-xs" style={{ color: 'var(--gm-danger)', margin: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}