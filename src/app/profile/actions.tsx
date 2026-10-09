'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  normalizeUsername,
  validateBio,
  validateBusinessHours,
  validateDisplayName,
  validatePhone,
  validateShopAddress,
  validateShopName,
  validateUsername,
} from '@/lib/profile/validation';

export type ActionResult = { ok: true } | { ok: false; error: string };

/* ============================================================
   UPDATE PROFILE
   ============================================================ */

type UpdateProfileInput = {
  displayName: string;
  username: string;
  bio: string;
  phone: string;
  locationId: string | null;
};

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const displayName = input.displayName.trim();
  const username = normalizeUsername(input.username);
  const bio = input.bio.trim();
  const phone = input.phone.trim();

  const checks = [
    validateDisplayName(displayName),
    validateUsername(username),
    validateBio(bio),
    validatePhone(phone),
  ];
  for (const result of checks) {
    if (!result.ok) return result;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data: current, error: currentError } = await supabase
    .from('profiles')
    .select('username, username_changed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (currentError || !current) {
    console.error('updateProfile read error:', currentError?.message);
    return { ok: false, error: 'Could not load your profile.' };
  }

  const currentUsername = (current.username as string | null) ?? '';
  const usernameChanged = currentUsername !== username;

  if (usernameChanged && currentUsername !== '') {
    const lastChange = current.username_changed_at as string | null;
    if (lastChange) {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - new Date(lastChange).getTime();
      if (elapsed < thirtyDaysMs) {
        const daysLeft = Math.ceil((thirtyDaysMs - elapsed) / (24 * 60 * 60 * 1000));
        return {
          ok: false,
          error: `You can only change your username once every 30 days. ${daysLeft} days left.`,
        };
      }
    }
  }

  if (usernameChanged) {
    const { data: taken } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .neq('id', user.id)
      .maybeSingle();

    if (taken) {
      return { ok: false, error: 'That username is already taken.' };
    }
  }

  const update: Record<string, unknown> = {
    display_name: displayName,
    username: username || null,
    bio: bio || null,
    phone: phone || null,
    location_id: input.locationId || null,
  };

  if (usernameChanged) {
    update.username_changed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id);

  if (updateError) {
    console.error('updateProfile write error:', updateError.message);
    return { ok: false, error: 'Could not save your profile.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/');
  revalidatePath('/browse');
  revalidatePath('/messages');

  return { ok: true };
}

/* ============================================================
   UPDATE SHOP INFO
   ============================================================ */

type UpdateShopInput = {
  shopName: string;
  shopAddress: string;
  businessHours: string;
  shopPhotos: string[];
};

export async function updateShopInfo(
  input: UpdateShopInput
): Promise<ActionResult> {
  const shopName = input.shopName.trim();
  const shopAddress = input.shopAddress.trim();
  const businessHours = input.businessHours.trim();

  const checks = [
    validateShopName(shopName),
    validateShopAddress(shopAddress),
    validateBusinessHours(businessHours),
  ];
  for (const result of checks) {
    if (!result.ok) return result;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.user_type !== 'shop') {
    return { ok: false, error: 'Only shop accounts can edit shop information.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return { ok: false, error: 'Server configuration error.' };
  }

  const photos = (input.shopPhotos ?? [])
    .filter(
      (url) =>
        typeof url === 'string' &&
        url.startsWith(
          `${supabaseUrl}/storage/v1/object/public/shop-photos/`
        )
    )
    .slice(0, 6);

  const { error } = await supabase
    .from('profiles')
    .update({
      shop_name: shopName || null,
      shop_address: shopAddress || null,
      business_hours: businessHours || null,
      shop_photos: photos,
    })
    .eq('id', user.id);

  if (error) {
    console.error('updateShopInfo error:', error.message);
    return { ok: false, error: 'Could not save shop information.' };
  }

  revalidatePath('/profile');
  revalidatePath('/');

  return { ok: true };
}

/* ============================================================
   UPDATE AVATAR URL
   ============================================================ */

export async function updateAvatarUrl(url: string): Promise<ActionResult> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, error: 'Missing avatar URL.' };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !trimmed.startsWith(supabaseUrl)) {
    return { ok: false, error: 'Invalid avatar URL.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: trimmed })
    .eq('id', user.id);

  if (error) {
    console.error('updateAvatarUrl error:', error.message);
    return { ok: false, error: 'Could not save avatar.' };
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/messages');

  return { ok: true };
}

/* ============================================================
   DELETE ACCOUNT
   ============================================================ */

const DELETE_PHRASE = 'delete my account';

export async function deleteAccount(
  confirmation: string
): Promise<ActionResult> {
  if (confirmation.trim().toLowerCase() !== DELETE_PHRASE) {
    return {
      ok: false,
      error: `Type "${DELETE_PHRASE}" exactly to confirm.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'You must be signed in.' };

  await supabase
    .from('products')
    .update({ status: 'archived' })
    .eq('seller_id', user.id)
    .in('status', ['active', 'paused', 'draft']);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      deleted_at: new Date().toISOString(),
      display_name: 'Deleted account',
      bio: null,
      avatar_url: null,
      phone: null,
      shop_name: null,
      shop_address: null,
      business_hours: null,
    })
    .eq('id', user.id);

  if (profileError) {
    console.error('deleteAccount profile error:', profileError.message);
    return { ok: false, error: 'Could not delete your account.' };
  }

  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}