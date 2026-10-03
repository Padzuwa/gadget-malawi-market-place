'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const COOKIE_NAME = 'gm-viewed';
const COOKIE_TTL_SECONDS = 60 * 60; // 1 hour dedupe window

export async function recordProductView(productId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value ?? '';

    const seen = raw ? raw.split(',').filter(Boolean) : [];
    if (seen.includes(productId)) return; // Already counted recently

    const next = [...seen, productId].slice(-50);
    cookieStore.set(COOKIE_NAME, next.join(','), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_TTL_SECONDS,
      path: '/',
    });

    const supabase = await createClient();
    const { error } = await supabase.rpc('increment_product_views', {
      product_id: productId,
    });

    if (error) {
      console.error('increment_product_views failed:', error.message);
    }
  } catch (err) {
    console.error('recordProductView error:', err);
  }
}