'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: string };

export async function toggleFavorite(
  productId: string
): Promise<ToggleFavoriteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be signed in to save favorites.' };
  }

  // Check current state
  const { data: existing } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('toggleFavorite delete error:', error.message);
      return { ok: false, error: 'Could not remove from favorites.' };
    }

    revalidatePath('/favorites');
    return { ok: true, favorited: false };
  }

  // Add
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, product_id: productId });

  if (error) {
    console.error('toggleFavorite insert error:', error.message);
    return { ok: false, error: 'Could not save to favorites.' };
  }

  revalidatePath('/favorites');
  return { ok: true, favorited: true };
}