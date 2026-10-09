'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons';
import { updateShopInfo } from '@/app/profile/actions';
import { ShopPhotosUploader } from './ShopPhotosUploader';
import type { OwnProfile } from '@/lib/data/profiles';

export function ShopInfoForm({ profile }: { profile: OwnProfile }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [shopName, setShopName] = useState(profile.shopName ?? '');
  const [shopAddress, setShopAddress] = useState(profile.shopAddress ?? '');
  const [businessHours, setBusinessHours] = useState(
    profile.businessHours ?? ''
  );
  const [shopPhotos, setShopPhotos] = useState<string[]>(
    profile.shopPhotos ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateShopInfo({
        shopName,
        shopAddress,
        businessHours,
        shopPhotos,
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
        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="shop_name">
            Shop name *
          </label>
          <input
            id="shop_name"
            className="gm-input"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            maxLength={80}
            placeholder="e.g. TechHub Malawi"
          />
        </div>

        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="shop_address">
            Shop address *
          </label>
          <textarea
            id="shop_address"
            className="gm-textarea"
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            maxLength={200}
            rows={2}
            placeholder="e.g. Chichiri Mall, Shop 14, Blantyre"
          />
        </div>

        <div className="gm-field gm-field-full">
          <label className="gm-label" htmlFor="business_hours">
            Business hours
          </label>
          <input
            id="business_hours"
            className="gm-input"
            type="text"
            value={businessHours}
            onChange={(e) => setBusinessHours(e.target.value)}
            maxLength={200}
            placeholder="e.g. Mon–Sat 8:00–18:00"
          />
        </div>
      </div>

      <div className="gm-field gm-field-full">
        <label className="gm-label">Shop photos</label>
        <ShopPhotosUploader
          value={shopPhotos}
          onChange={setShopPhotos}
          max={6}
        />
        <span className="gm-xs gm-subtle">
          These appear on your public profile. The first photo is your cover.
        </span>
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
            'Save shop info'
          )}
        </button>
      </div>
    </form>
  );
}