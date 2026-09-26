import { createClient } from '@/lib/supabase/server';

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    if (error) console.error('getCategories error:', error.message);
    return [];
  }

  return data.map((row) => row.name as string);
}

export async function getLocations(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('locations')
    .select('name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    if (error) console.error('getLocations error:', error.message);
    return [];
  }

  return data.map((row) => row.name as string);
}