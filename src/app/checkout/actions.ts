'use server';
// This file contains server actions for the checkout process, including placing an order.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { DeliveryMethod } from '@/lib/orders/types';

export type CheckoutInput = {
  items: { productId: string; quantity: number }[];
  buyerPhone: string;
  buyerNote?: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
};

export type CheckoutResult =
  | { ok: true; firstOrderId: string; checkoutId: string }
  | { ok: false; error: string };

export async function placeOrder(
  input: CheckoutInput
): Promise<CheckoutResult> {
  // ---------- Validation ----------
  if (!input.items.length) {
    return { ok: false, error: 'Your cart is empty.' };
  }

  const phone = input.buyerPhone.trim();
  if (!phone || phone.replace(/\D/g, '').length < 9) {
    return { ok: false, error: 'Please enter a valid phone number.' };
  }

  if (input.deliveryMethod === 'delivery') {
    if (!input.deliveryAddress || input.deliveryAddress.trim().length < 6) {
      return {
        ok: false,
        error: 'Please provide a delivery address (at least 6 characters).',
      };
    }
  }

  const note = (input.buyerNote ?? '').trim().slice(0, 500);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: 'You must be signed in.' };

  // ---------- Fetch real product data ----------
  // Never trust the client cart. Re-fetch from DB and use DB prices.

  const productIds = input.items.map((i) => i.productId);

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(
      'id, seller_id, title, subtitle, price, primary_image_url, condition, status'
    )
    .in('id', productIds);

  if (productsError || !products) {
    console.error('placeOrder fetch products error:', productsError?.message);
    return { ok: false, error: 'Could not verify cart items.' };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Build validated line items, grouped by seller
  type Line = {
    productId: string;
    sellerId: string;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    condition: string | null;
    price: number;
    quantity: number;
    lineTotal: number;
  };

  const linesBySeller = new Map<string, Line[]>();

  for (const item of input.items) {
    const p = productMap.get(item.productId);

    if (!p) {
      return {
        ok: false,
        error: 'One of your items is no longer available.',
      };
    }

    if (p.status !== 'active') {
      return {
        ok: false,
        error: `"${p.title}" is no longer for sale. Please remove it from your cart.`,
      };
    }

    if (p.seller_id === user.id) {
      return {
        ok: false,
        error: `You cannot buy your own listing ("${p.title}").`,
      };
    }

    const qty = Math.max(1, Math.min(item.quantity, 99));
    const line: Line = {
      productId: p.id,
      sellerId: p.seller_id,
      title: p.title,
      subtitle: p.subtitle,
      imageUrl: p.primary_image_url,
      condition: p.condition,
      price: Number(p.price),
      quantity: qty,
      lineTotal: Number(p.price) * qty,
    };

    const existing = linesBySeller.get(p.seller_id) ?? [];
    existing.push(line);
    linesBySeller.set(p.seller_id, existing);
  }

  if (linesBySeller.size === 0) {
    return { ok: false, error: 'No valid items in your cart.' };
  }

  // ---------- Create the checkout ----------
  const checkoutId = crypto.randomUUID();
  const createdOrders: string[] = [];

  for (const [sellerId, lines] of linesBySeller.entries()) {
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const deliveryFee = 0; // set later when delivery partners are wired
    const total = subtotal + deliveryFee;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        checkout_id: checkoutId,
        buyer_id: user.id,
        seller_id: sellerId,
        status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        total,
        currency: 'MWK',
        delivery_method: input.deliveryMethod,
        delivery_address:
          input.deliveryMethod === 'delivery'
            ? input.deliveryAddress!.trim()
            : null,
        buyer_phone: phone,
        buyer_note: note || null,
      })
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('placeOrder insert order error:', orderError?.message);
      return { ok: false, error: 'Could not create your order. Try again.' };
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        lines.map((l) => ({
          order_id: order.id,
          product_id: l.productId,
          title: l.title,
          subtitle: l.subtitle,
          image_url: l.imageUrl,
          condition: l.condition,
          price: l.price,
          quantity: l.quantity,
          line_total: l.lineTotal,
        }))
      );

    if (itemsError) {
      console.error('placeOrder insert items error:', itemsError.message);
      // Roll back the order
      await supabase.from('orders').delete().eq('id', order.id);
      return { ok: false, error: 'Could not save order items. Try again.' };
    }

    createdOrders.push(order.id);
  }

  revalidatePath('/orders');
  revalidatePath('/dashboard');

  return {
    ok: true,
    firstOrderId: createdOrders[0],
    checkoutId,
  };
}