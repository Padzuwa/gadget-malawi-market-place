'use server';

import { createClient } from '@/lib/supabase/server';

export type ReportReason =
  | 'scam'
  | 'stolen'
  | 'counterfeit'
  | 'wrong-category'
  | 'offensive'
  | 'spam'
  | 'prohibited'
  | 'other';

export type SubmitReportResult =
  | { ok: true }
  | { ok: false; error: string };

type Input = {
  productId: string;
  reason: ReportReason;
  details?: string;
};

const VALID_REASONS: ReportReason[] = [
  'scam',
  'stolen',
  'counterfeit',
  'wrong-category',
  'offensive',
  'spam',
  'prohibited',
  'other',
];

export async function submitReport(
  input: Input
): Promise<SubmitReportResult> {
  if (!input.productId) {
    return { ok: false, error: 'Missing product reference.' };
  }

  if (!VALID_REASONS.includes(input.reason)) {
    return { ok: false, error: 'Please pick a valid reason.' };
  }

  const details = (input.details ?? '').trim();
  if (details.length > 1000) {
    return { ok: false, error: 'Details are too long (max 1000 chars).' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Look up the seller for context
  const { data: product } = await supabase
    .from('products')
    .select('seller_id')
    .eq('id', input.productId)
    .maybeSingle();

  if (!product) {
    return { ok: false, error: 'This listing no longer exists.' };
  }

  // Users cannot report their own listings
  if (user && product.seller_id === user.id) {
    return { ok: false, error: 'You cannot report your own listing.' };
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user?.id ?? null,
    product_id: input.productId,
    reported_user_id: product.seller_id,
    reason: input.reason,
    details: details || null,
  });

  if (error) {
    console.error('submitReport error:', error.message);
    return { ok: false, error: 'Could not submit report. Try again.' };
  }

  return { ok: true };
}