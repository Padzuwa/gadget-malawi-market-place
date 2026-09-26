'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ProductStatus } from '@/lib/types';

export type ActionResult = { ok: true } | { ok: false; error: string };

const ALLOWED_STATUSES: ProductStatus[] = [
  'active',
  'paused',
  'sold',
  'archived',
];

/**
 * Update the status of a listing the current user owns.
 * RLS handles the ownership check, but we also validate the status value.
 */
export async function updateListingStatus(
  productId: string,
  status: ProductStatus
): Promise<ActionResult> {
  if (!ALLOWED_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId)
    .eq('seller_id', user.id);

  if (error) {
    console.error('updateListingStatus error:', error.message);
    return { ok: false, error: 'Could not update listing.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/browse');
  revalidatePath('/');
  return { ok: true };
}

/**
 * Delete a listing the current user owns.
 * Note: this is a hard delete. The storage images are NOT removed here —
 * that's a separate cleanup we can add later.
 */
export async function deleteListing(productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('seller_id', user.id);

  if (error) {
    console.error('deleteListing error:', error.message);
    return { ok: false, error: 'Could not delete listing.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/browse');
  revalidatePath('/');
  return { ok: true };
}