import { createClient } from '@/lib/supabase/server';
import type {
  DeliveryMethod,
  Order,
  OrderItem,
  OrderStatus,
} from '@/lib/orders/types';

type OrderRow = {
  id: string;
  checkout_id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  delivery_method: DeliveryMethod;
  delivery_address: string | null;
  buyer_phone: string;
  buyer_note: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  released_at: string | null;
  seller: {
    display_name: string | null;
    shop_name: string | null;
    shop_verified: boolean | null;
  } | null;
  order_items: OrderItemRow[];
};

type OrderItemRow = {
  id: string;
  product_id: string | null;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  condition: string | null;
  price: number;
  quantity: number;
  line_total: number;
};

const ORDER_SELECT = `
  id,
  checkout_id,
  buyer_id,
  seller_id,
  status,
  subtotal,
  delivery_fee,
  total,
  currency,
  delivery_method,
  delivery_address,
  buyer_phone,
  buyer_note,
  created_at,
  updated_at,
  paid_at,
  shipped_at,
  delivered_at,
  released_at,
  seller:profiles!orders_seller_id_fkey(display_name, shop_name, shop_verified),
  order_items(
    id,
    product_id,
    title,
    subtitle,
    image_url,
    condition,
    price,
    quantity,
    line_total
  )
`;

function mapRow(row: OrderRow): Order {
  return {
    id: row.id,
    checkoutId: row.checkout_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    sellerName:
      row.seller?.shop_name || row.seller?.display_name || 'Seller',
    sellerVerified: Boolean(row.seller?.shop_verified),
    status: row.status,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    currency: row.currency,
    deliveryMethod: row.delivery_method,
    deliveryAddress: row.delivery_address,
    buyerPhone: row.buyer_phone,
    buyerNote: row.buyer_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    releasedAt: row.released_at,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      productId: i.product_id,
      title: i.title,
      subtitle: i.subtitle,
      imageUrl: i.image_url,
      condition: i.condition,
      price: Number(i.price),
      quantity: i.quantity,
      lineTotal: Number(i.line_total),
    })),
  };
}

/** Orders where the current user is the buyer. */
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getMyOrders error:', error.message);
    return [];
  }

  return (data as unknown as OrderRow[]).map(mapRow);
}

/** Orders where the current user is the seller. */
export async function getIncomingOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('getIncomingOrders error:', error.message);
    return [];
  }

  return (data as unknown as OrderRow[]).map(mapRow);
}

/** Load a single order by ID — only if the caller is buyer or seller. */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('getOrderById error:', error.message);
    return null;
  }

  return mapRow(data as unknown as OrderRow);
}