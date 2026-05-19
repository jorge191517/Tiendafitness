/**
 * Servicio de categorías.
 * Lee categorías desde Supabase. Fallback a datos locales.
 */

import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/lib/supabase/types';
import type { ProductCategory } from '@/data/types';
import { categories as localCategories } from '@/data/categories';

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const iconMap: Record<string, string> = {
  'fitness-gym': 'Dumbbell',
  'padel': 'CircleDot',
  'ropa-deportiva': 'Shirt',
  'accesorios': 'Watch',
  'suplementos': 'Pill',
};

function dbCategoryToLocal(c: Category): ProductCategory {
  return {
    id: 0,
    name: c.name,
    slug: c.slug,
    icon: iconMap[c.slug] ?? 'Tag',
    description: c.description ?? undefined,
  };
}

/** Obtiene todas las categorías activas */
export async function getCategories(): Promise<ProductCategory[]> {
  if (!isSupabaseConfigured()) return localCategories;
  
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error || !data) return localCategories;
    return data.map(dbCategoryToLocal);
  } catch {
    return localCategories;
  }
}
