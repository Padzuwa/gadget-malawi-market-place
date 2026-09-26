'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const MIN_IMAGES = 2;

export type CreateProductInput = {
  title: string;
  subtitle: string;
  description: string;
  categoryId: string;
  locationId: string;
  condition: 'new' | 'like-new' | 'used';
  price: number;
  specs: Record<string, string>;
  imageUrls: string[];
};

export type CreateProductResult = { error: string } | never;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to publish a listing.' };
  }

  if (!input.title.trim() || input.title.trim().length < 4) {
    return { error: 'Title must be at least 4 characters.' };
  }
  if (!input.categoryId) {
    return { error: 'Please choose a category.' };
  }
  if (!input.locationId) {
    return { error: 'Please choose a location.' };
  }
  if (!input.price || input.price <= 0) {
    return { error: 'Price must be greater than zero.' };
  }
  if (input.imageUrls.length < MIN_IMAGES) {
    return {
      error: `Please upload at least ${MIN_IMAGES} photos. Listings with more photos build buyer trust.`,
    };
  }

  const baseSlug = slugify(input.title) || 'listing';
  const uniqueSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      category_id: input.categoryId,
      location_id: input.locationId,
      title: input.title.trim(),
      subtitle: input.subtitle.trim() || null,
      slug: uniqueSlug,
      description: input.description.trim() || null,
      price: input.price,
      currency: 'MWK',
      condition: input.condition,
      specs: input.specs,
      status: 'active',
      primary_image_url: input.imageUrls[0],
      image_urls: input.imageUrls,
    })
    .select('slug')
    .single();

  if (error) {
    console.error('createProduct error:', error.message);
    return { error: 'Could not publish listing. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/browse');

  redirect(`/product/${data.slug}`);
}
export type UpdateProductInput = CreateProductInput & {
  listingId: string;
};

export async function updateProduct(
  input: UpdateProductInput
): Promise<CreateProductResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to update a listing.' };
  }

  if (!input.listingId) {
    return { error: 'Missing listing identifier.' };
  }

  if (!input.title.trim() || input.title.trim().length < 4) {
    return { error: 'Title must be at least 4 characters.' };
  }
  if (!input.categoryId) {
    return { error: 'Please choose a category.' };
  }
  if (!input.locationId) {
    return { error: 'Please choose a location.' };
  }
  if (!input.price || input.price <= 0) {
    return { error: 'Price must be greater than zero.' };
  }
  if (input.imageUrls.length < MIN_IMAGES) {
    return {
      error: `Please keep at least ${MIN_IMAGES} photos. Listings with more photos build buyer trust.`,
    };
  }

  const { data, error } = await supabase
    .from('products')
    .update({
      category_id: input.categoryId,
      location_id: input.locationId,
      title: input.title.trim(),
      subtitle: input.subtitle.trim() || null,
      description: input.description.trim() || null,
      price: input.price,
      condition: input.condition,
      specs: input.specs,
      primary_image_url: input.imageUrls[0],
      image_urls: input.imageUrls,
    })
    .eq('id', input.listingId)
    .eq('seller_id', user.id)
    .select('slug')
    .single();

  if (error || !data) {
    console.error('updateProduct error:', error?.message);
    return { error: 'Could not update listing. Please try again.' };
  }

  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/dashboard');
  revalidatePath(`/product/${data.slug}`);

  redirect(`/product/${data.slug}`);
}