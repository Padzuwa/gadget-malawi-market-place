import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { getProductBySlug, getSimilarProducts } from '@/lib/data/products';
import { getMyFavoriteIds } from '@/lib/data/favorites';
import { ProductViewTracker } from '@/components/product/ProductViewTracker';                                      
import { createClient } from '@/lib/supabase/server';
type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product not found' };
  }

  const description = `${product.title} — ${product.subtitle}. ${product.condition} condition, located in ${product.location}. ${product.currency} ${product.price}.`;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
      type: 'website',
      images: product.imageUrl
        ? [
            {
              url: product.imageUrl,
              width: 800,
              height: 600,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
      
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnListing = !!user && user.id === product.sellerId;

  const [similar, favoriteIds] = await Promise.all([
    getSimilarProducts(product, 4),
    user ? getMyFavoriteIds() : Promise.resolve(new Set<string>()),
  ]);

  const isFavorited = favoriteIds.has(product.id);

  return (
    <>
    <ProductViewTracker productId={product.id} />
      <ProductDetail
        product={product}
        galleryImages={product.images}
        isOwnListing={isOwnListing}
        isFavorited={isFavorited}
      />
      {similar.length > 0 ? (
        <SimilarProducts products={similar} currentProduct={product} />
      ) : null}
    </>
  );
}