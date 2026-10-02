'use server';
// This file contains server actions for the checkout process, including placing an order.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Buyer marks an order as received. */
export async function markDelivered(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in required.' };

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .in('status', ['paid', 'shipped']);

  if (error) {
    console.error('markDelivered error:', error.message);
    return { ok: false, error: 'Could not confirm delivery.' };
  }

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/dashboard');
  return { ok: true };
}

/** Seller marks a paid order as shipped. */
export async function markShipped(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in required.' };

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'shipped',
      shipped_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('seller_id', user.id)
    .eq('status', 'paid');

  if (error) {
    console.error('markShipped error:', error.message);
    return { ok: false, error: 'Could not update order.' };
  }

  revalidatePath('/dashboard/orders');
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

/** Buyer or seller cancels a pending (unpaid) order. */
export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in required.' };

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .in('status', ['pending'])
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

  if (error) {
    console.error('cancelOrder error:', error.message);
    return { ok: false, error: 'Could not cancel order.' };
  }

  revalidatePath('/orders');
  revalidatePath('/dashboard/orders');
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}