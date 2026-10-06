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
  | 'harassment'
  | 'off-platform'
  | 'other';

export type SubmitReportResult = { ok: true } | { ok: false; error: string };

const VALID_REASONS: ReportReason[] = [
  'scam',
  'stolen',
  'counterfeit',
  'wrong-category',
  'offensive',
  'spam',
  'prohibited',
  'harassment',
  'off-platform',
  'other',
];

type ProductReportInput = {
  kind: 'product';
  productId: string;
  reason: ReportReason;
  details?: string;
};

type ConversationReportInput = {
  kind: 'conversation';
  conversationId: string;
  reason: ReportReason;
  details?: string;
};

type Input = ProductReportInput | ConversationReportInput;

export async function submitReport(
  input: Input
): Promise<SubmitReportResult> {
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

  if (input.kind === 'product') {
    if (!input.productId) {
      return { ok: false, error: 'Missing product reference.' };
    }

    const { data: product } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', input.productId)
      .maybeSingle();

    if (!product) {
      return { ok: false, error: 'This listing no longer exists.' };
    }

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
      console.error('submitReport (product) error:', error.message);
      return { ok: false, error: 'Could not submit report. Try again.' };
    }

    return { ok: true };
  }

  // Conversation report
  if (!input.conversationId) {
    return { ok: false, error: 'Missing conversation reference.' };
  }

  const { data: conv } = await supabase
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', input.conversationId)
    .maybeSingle();

  if (!conv) {
    return { ok: false, error: 'This conversation no longer exists.' };
  }

  // Reported user is the other participant
  const reportedUserId =
    user && conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;

  const { error } = await supabase.from('reports').insert({
    reporter_id: user?.id ?? null,
    conversation_id: input.conversationId,
    reported_user_id: reportedUserId,
    reason: input.reason,
    details: details || null,
  });

  if (error) {
    console.error('submitReport (conversation) error:', error.message);
    return { ok: false, error: 'Could not submit report. Try again.' };
  }

  return { ok: true };
}