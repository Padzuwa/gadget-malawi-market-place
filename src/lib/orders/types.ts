export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'released'
  | 'cancelled'
  | 'refunded';

export type DeliveryMethod = 'pickup' | 'delivery';

export type OrderItem = {
  id: string;
  productId: string | null;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  condition: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  checkoutId: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string | null;
  buyerPhone: string;
  buyerNote: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  items: OrderItem[];
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid — in escrow',
  shipped: 'Shipped',
  delivered: 'Delivered',
  released: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'gm-badge-used',
  paid: 'gm-badge-new',
  shipped: 'gm-badge-verified',
  delivered: 'gm-badge-new',
  released: 'gm-badge-new',
  cancelled: 'gm-badge-sold',
  refunded: 'gm-badge-sold',
};