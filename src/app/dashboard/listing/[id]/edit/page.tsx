import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyListingById } from '@/lib/data/seller';
import { SellForm } from '@/components/sell/SellForm';

export const metadata: Metadata = {
  title: 'Edit listing',
  description: 'Update your Gadget Malawi listing.',
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/listing/${id}/edit`);
  }

  const [listing, categoriesRes, locationsRes] = await Promise.all([
    getMyListingById(id),
    supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('locations')
      .select('id, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (!listing) {
    notFound();
  }

  const categories = categoriesRes.data ?? [];
  const locations = locationsRes.data ?? [];

  return (
    <div className="gm-stack" style={{ gap: 24, maxWidth: 860 }}>
      <div>
        <span className="gm-eyebrow">Edit listing</span>
        <h1 className="gm-title" style={{ marginTop: 6 }}>
          {listing.title}
        </h1>
        <p className="gm-muted" style={{ marginTop: 8, maxWidth: 620 }}>
          Update any details below. Changes go live immediately.
        </p>
      </div>

      <SellForm
        categories={categories}
        locations={locations}
        mode="edit"
        listingId={listing.id}
        initialValues={{
          title: listing.title,
          subtitle: listing.subtitle,
          description: listing.description,
          categoryId: listing.categoryId,
          locationId: listing.locationId,
          condition: listing.condition,
          price: String(listing.price),
          specs: listing.specs,
          images: listing.images,
        }}
      />
    </div>
  );
}