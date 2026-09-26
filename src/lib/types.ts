export type ProductCondition = 'new' | 'like-new' | 'used';

export type ProductStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'sold'
  | 'archived';

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  currency: 'MWK';
  condition: ProductCondition;
  category: string;
  location: string;
  imageUrl: string;
  seller: {
    name: string;
    verified: boolean;
  };
};