import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SellForm } from '@/components/sell/SellForm';
// This page allows authenticated users to create a new product listing. It fetches the list of active categories and locations from the database and passes them to the SellForm component. If the user is not authenticated, they are redirected to the login page with a `next` parameter pointing back to this page.
export const metadata: Metadata = {
  title: 'Sell a gadget',
  description:
    'List your gadget on Gadget Malawi and reach buyers across the country.',
};

export default async function SellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/sell');
  }

  const [categoriesRes, locationsRes] = await Promise.all([
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

  const categories = categoriesRes.data ?? [];
  const locations = locationsRes.data ?? [];

  return (
    <div className="gm-stack" style={{ gap: 24, maxWidth: 860 }}>
      <div>
        <span className="gm-eyebrow">New listing</span>
        <h1 className="gm-title" style={{ marginTop: 6 }}>
          Sell a gadget
        </h1>
        <p className="gm-muted" style={{ marginTop: 8, maxWidth: 620 }}>
          List your item in under a minute. Clear photos, honest condition,
          and a fair price sell fastest.
        </p>
      </div>

      <SellForm categories={categories} locations={locations} />
    </div>
  );
}