export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  location: string;
  condition: 'new' | 'like-new' | 'used';
  quantity: number;
  addedAt: string;
};