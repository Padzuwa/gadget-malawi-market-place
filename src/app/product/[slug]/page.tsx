import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { SimilarProducts } from '@/components/product/SimilarProducts';
import { getProductBySlug, getSimilarProducts } from '@/lib/data/products';
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

  return {
    title: product.title,
    description: `${product.title} — ${product.subtitle}. ${product.condition} condition, located in ${product.location}. ${product.currency} ${product.price}.`,
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
  const similar = await getSimilarProducts(product, 4);

  return (
    <>
      <ProductDetail
        product={product}
        galleryImages={product.images}
        isOwnListing={isOwnListing}
      />
      {similar.length > 0 ? (
        <SimilarProducts products={similar} currentProduct={product} />
      ) : null}
    </>
  );
}