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
  /** Primary image URL (first in `images`). Kept for card grids. */
  imageUrl: string;
  /** All image URLs. Empty if the listing has no photos. */
  images: string[];
  sellerId: string;
  seller: {
    name: string;
    verified: boolean;
  };
};