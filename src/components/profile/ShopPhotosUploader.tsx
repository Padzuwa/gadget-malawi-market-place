'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faSpinner,
  faTrash,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { uploadShopPhoto } from '@/lib/supabase/storage';

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

export function ShopPhotosUploader({ value, onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = max - value.length;

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const incoming = Array.from(files).slice(0, remaining);
    if (incoming.length === 0) return;

    setUploading(true);
    const next = [...value];

    for (const file of incoming) {
      try {
        const result = await uploadShopPhoto(file);
        next.push(result.url);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Upload failed. Try again.'
        );
        break;
      }
    }

    setUploading(false);
    if (next.length !== value.length) onChange(next);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  function removePhoto(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="gm-stack" style={{ gap: 10 }}>
      {value.length < max ? (
        <div
          className="gm-upload-zone gm-shop-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (!uploading) inputRef.current?.click();
            }
          }}
          aria-label="Upload shop photos"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onInputChange}
          />

          <div style={{ textAlign: 'center' }}>
            <FontAwesomeIcon
              icon={uploading ? faSpinner : faCloudArrowUp}
              spin={uploading}
              className="gm-upload-zone-icon"
            />
            <strong style={{ display: 'block', marginTop: 10 }}>
              {uploading
                ? 'Uploading…'
                : 'Drop photos here or click to upload'}
            </strong>
            <span
              className="gm-small gm-muted"
              style={{ display: 'block', marginTop: 4 }}
            >
              Front of shop, interior, signage — up to {max} photos
            </span>
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          className="gm-small"
          style={{ color: 'var(--gm-danger)', margin: 0 }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {value.length > 0 ? (
        <div className="gm-shop-photos-grid">
          {value.map((url, index) => (
            <div key={url} className="gm-shop-photo">
              <img src={url} alt={`Shop photo ${index + 1}`} />
              <button
                type="button"
                className="gm-shop-photo-remove"
                onClick={() => removePhoto(url)}
                aria-label="Remove photo"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              {index === 0 ? (
                <span className="gm-shop-photo-badge">Cover</span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p
          className="gm-xs gm-subtle"
          style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FontAwesomeIcon icon={faImage} /> No photos yet
        </p>
      )}
    </div>
  );
}