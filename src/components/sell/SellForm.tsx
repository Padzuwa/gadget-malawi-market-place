'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/app/sell/actions';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { DynamicSpecFields } from './DynamicSpecFields';
import type { UploadedImage } from '@/lib/supabase/storage';

const MIN_IMAGES = 2;

type Category = { id: string; name: string };
type Location = { id: string; name: string };

export type SellFormInitialValues = {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  locationId: string;
  condition: 'new' | 'like-new' | 'used';
  price: string;
  specs: Record<string, string>;
  images: UploadedImage[];
};

type Props = {
  categories: Category[];
  locations: Location[];
  mode?: 'create' | 'edit';
  listingId?: string;
  initialValues?: SellFormInitialValues;
};

export function SellForm({
  categories,
  locations,
  mode = 'create',
  listingId,
  initialValues,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [subtitle, setSubtitle] = useState(initialValues?.subtitle ?? '');
  const [description, setDescription] = useState(
    initialValues?.description ?? ''
  );
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [locationId, setLocationId] = useState(initialValues?.locationId ?? '');
  const [condition, setCondition] = useState<'new' | 'like-new' | 'used'>(
    initialValues?.condition ?? 'used'
  );
  const [price, setPrice] = useState(initialValues?.price ?? '');
  const [specs, setSpecs] = useState<Record<string, string>>(
    initialValues?.specs ?? {}
  );
  const [images, setImages] = useState<UploadedImage[]>(
    initialValues?.images ?? []
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const hasEnoughImages = images.length >= MIN_IMAGES;
  const isEdit = mode === 'edit';

  function updateSpec(key: string, value: string) {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(newId: string) {
    if (newId === categoryId) return;
    setCategoryId(newId);
    // Only clear specs when creating. When editing, keep whatever the
    // seller already typed in case they toggle back to the same category.
    if (!isEdit) setSpecs({});
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!hasEnoughImages) {
      setError(
        `Please upload at least ${MIN_IMAGES} photos. Listings with more photos sell faster and build buyer trust.`
      );
      return;
    }

    startTransition(async () => {
      const baseInput = {
        title,
        subtitle,
        description,
        categoryId,
        locationId,
        condition,
        price: Number(price),
        specs,
        imageUrls: images.map((img) => img.url),
      };

      const result = isEdit && listingId
        ? await updateProduct({ ...baseInput, listingId })
        : await createProduct(baseInput);

      if (result && 'error' in result) {
        setError(result.error);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="gm-stack" style={{ gap: 28 }}>
      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
        <div>
          <h2 className="gm-section-title" style={{ fontSize: '1.15rem' }}>
            Photos
          </h2>
          <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
            At least {MIN_IMAGES} photos required. First image is your cover.
            Up to 6 images.
          </p>
        </div>
        <ImageUploader
          value={images}
          onChange={setImages}
          max={6}
          min={MIN_IMAGES}
          hint={`JPG, PNG, or WebP · minimum ${MIN_IMAGES} images · up to 6 · compressed automatically`}
        />
      </section>

      <section className="gm-card gm-card-pad gm-stack" style={{ gap: 18 }}>
        <h2 className="gm-section-title" style={{ fontSize: '1.15rem' }}>
          Item details
        </h2>

        <div className="gm-form-grid">
          <div className="gm-field gm-field-full">
            <label className="gm-label" htmlFor="title">
              Title *
            </label>
            <input
              id="title"
              className="gm-input"
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Air M2 13-inch"
            />
          </div>

          <div className="gm-field gm-field-full">
            <label className="gm-label" htmlFor="subtitle">
              Short description
            </label>
            <input
              id="subtitle"
              className="gm-input"
              type="text"
              maxLength={120}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. 8GB RAM · 256GB SSD"
            />
          </div>

          <div className="gm-field">
            <label className="gm-label" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              className="gm-select"
              required
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gm-field">
            <label className="gm-label" htmlFor="location">
              Location *
            </label>
            <select
              id="location"
              className="gm-select"
              required
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">Select a location…</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gm-field">
            <label className="gm-label" htmlFor="condition">
              Condition *
            </label>
            <select
              id="condition"
              className="gm-select"
              required
              value={condition}
              onChange={(e) =>
                setCondition(e.target.value as 'new' | 'like-new' | 'used')
              }
            >
              <option value="new">New</option>
              <option value="like-new">Like new</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div className="gm-field">
            <label className="gm-label" htmlFor="price">
              Price (MWK) *
            </label>
            <input
              id="price"
              className="gm-input"
              type="number"
              inputMode="numeric"
              min={1}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 450000"
            />
          </div>
        </div>
      </section>

      {selectedCategory ? (
        <section className="gm-card gm-card-pad gm-stack" style={{ gap: 14 }}>
          <div>
            <h2 className="gm-section-title" style={{ fontSize: '1.15rem' }}>
              {selectedCategory.name} specs
            </h2>
            <p className="gm-small gm-muted" style={{ marginTop: 6 }}>
              These help buyers filter and find your item faster.
            </p>
          </div>
          <DynamicSpecFields
            categoryName={selectedCategory.name}
            values={specs}
            onChange={updateSpec}
          />
        </section>
      ) : null}

      <section className="gm-card gm-card-pad">
        <div className="gm-field">
          <label className="gm-label" htmlFor="description">
            Full description
          </label>
          <textarea
            id="description"
            className="gm-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell buyers about the item — condition, what's included, any faults, warranty, and why you're selling."
            maxLength={2000}
          />
          <span className="gm-xs gm-subtle" style={{ marginTop: 4 }}>
            {description.length} / 2000
          </span>
        </div>
      </section>

      {error ? (
        <p
          className="gm-small"
          style={{ color: 'var(--gm-danger)', margin: 0 }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="gm-row" style={{ gap: 12, flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="gm-btn gm-btn-primary"
          disabled={pending || !hasEnoughImages}
        >
          {pending
            ? isEdit
              ? 'Saving…'
              : 'Publishing…'
            : isEdit
            ? 'Save changes'
            : 'Publish listing'}
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </button>
      </div>

      {!hasEnoughImages ? (
        <p className="gm-xs gm-subtle" style={{ margin: 0 }}>
          Add {MIN_IMAGES - images.length} more{' '}
          {MIN_IMAGES - images.length === 1 ? 'photo' : 'photos'} to enable
          {isEdit ? ' saving.' : ' publishing.'}
        </p>
      ) : null}
    </form>
  );
}