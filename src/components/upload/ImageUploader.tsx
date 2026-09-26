'use client';

import { useCallback, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faSpinner,
  faTrash,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import {
  uploadProductImage,
  deleteProductImage,
  type UploadedImage,
} from '@/lib/supabase/storage';

export type ImageUploaderProps = {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
  min?: number;
  hint?: string;
};

export function ImageUploader({
  value,
  onChange,
  max = 6,
  min = 0,
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = max - value.length;
  const meetsMinimum = value.length >= min;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(files).slice(0, remaining);

      if (incoming.length === 0) return;

      setUploading(true);
      const uploaded: UploadedImage[] = [];

      for (const file of incoming) {
        try {
          const result = await uploadProductImage(file);
          uploaded.push(result);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Upload failed. Try again.'
          );
          break;
        }
      }

      setUploading(false);

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
      }
    },
    [onChange, remaining, value]
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }

  async function removeImage(img: UploadedImage) {
    deleteProductImage(img.path).catch(() => {});
    onChange(value.filter((v) => v.path !== img.path));
  }

  return (
    <div className="gm-stack" style={{ gap: 14 }}>
      <div
        className={`gm-upload-zone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload product images"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onInputChange}
        />

        <div className="gm-upload-zone-content">
          <FontAwesomeIcon
            icon={uploading ? faSpinner : faCloudArrowUp}
            spin={uploading}
            className="gm-upload-zone-icon"
          />
          <strong style={{ display: 'block', marginTop: 12 }}>
            {uploading
              ? 'Uploading…'
              : remaining > 0
              ? 'Drop images here or click to upload'
              : 'Maximum images reached'}
          </strong>
          <span
            className="gm-small gm-muted"
            style={{ display: 'block', marginTop: 4 }}
          >
            {hint ??
              `JPG, PNG, or WebP · up to ${max} images · compressed automatically`}
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

      {value.length > 0 ? (
        <>
          <div className="gm-upload-grid">
            {value.map((img, index) => (
              <div key={img.path} className="gm-upload-thumb">
                <img src={img.url} alt={`Upload ${index + 1}`} />
                <button
                  type="button"
                  className="gm-upload-thumb-remove"
                  onClick={() => removeImage(img)}
                  aria-label="Remove image"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                {index === 0 ? (
                  <span className="gm-upload-thumb-badge">Cover</span>
                ) : null}
              </div>
            ))}
          </div>

          {min > 0 ? (
            <p
              className="gm-small"
              style={{
                margin: 0,
                color: meetsMinimum
                  ? 'var(--gm-success)'
                  : 'var(--gm-text-muted)',
              }}
            >
              {meetsMinimum
                ? `${value.length} of ${max} photos added — looks good.`
                : `${value.length} of ${min} required photos added. Add ${
                    min - value.length
                  } more to publish.`}
            </p>
          ) : null}
        </>
      ) : (
        <p
          className="gm-small gm-subtle"
          style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FontAwesomeIcon icon={faImage} /> No images yet
        </p>
      )}
    </div>
  );
}