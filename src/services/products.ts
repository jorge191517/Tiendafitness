/**
 * Servicio de productos.
 * Lee productos desde Supabase. Fallback a datos locales si Supabase
 * no está configurado O si Supabase no tiene productos todavía.
 *
 * REGLA DE FALLBACK:
 *   - Si Supabase no está configurado → datos locales
 *   - Si Supabase devuelve error → datos locales
 *   - Si Supabase devuelve array vacío → datos locales
 *   - Si Supabase devuelve productos → datos de Supabase
 *
 * Los productos locales usan estructura base+variantes.
 * Un producto base tiene variants[] con las diferentes opciones de color.
 */

import { createClient } from '@/lib/supabase/server';
import type { ProductDB } from '@/lib/supabase/types';
import type { Product } from '@/data/types';
import {
  allProducts as localAllProducts,
  featuredProducts as localFeatured,
  activeCategories as localActiveCategories,
  getProductsByCategory as localGetByCategory,
  getProductsBySubcategory as localGetBySubcategory,
  getProductBySlug as localGetBySlug,
} from '@/data/products';

/** Convierte un ProductDB de Supabase al tipo Product local */
function dbProductToLocal(p: ProductDB & Record<string, unknown>): Product {
  return {
    id: 0,
    name: p.name,
    slug: p.slug,
    category: p.category?.slug ?? '',
    categoryName: p.category?.name ?? undefined,
    description: p.description ?? '',
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image: p.image_url ?? '',
    rating: Number(p.rating),
    reviews: p.reviews_count,
    badge: p.badge ?? undefined,
    featured: p.featured,
    stock: p.stock_status as Product['stock'],
    sizes: p.sizes as string[] | undefined,
    color: p.color as string | undefined,
    colorName: p.color_name as string | undefined,
    subcategory: p.subcategory as string | undefined,
    subcategoryName: p.subcategory_name as string | undefined,
    variantGroup: p.variant_group as string | undefined,
    variants: undefined,
  };
}

/** Verifica si Supabase está configurado */
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Lógica centralizada de fallback.
 * Si Supabase devuelve un array vacío (sin errores), consideramos
 * que aún no tiene productos y devolvemos los datos locales.
 */
function withFallback<T>(supabaseData: T[] | null | undefined, localData: T[]): T[] {
  if (!supabaseData || supabaseData.length === 0) return localData;
  return supabaseData;
}

// ─── Funciones de consulta ──────────────────────────────────────────────────

/** Obtiene todos los productos activos */
export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return localAllProducts;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) return localAllProducts;
    return withFallback(data, localAllProducts);
  } catch {
    return localAllProducts;
  }
}

/** Obtiene productos destacados */
export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return localFeatured;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('active', true)
      .eq('featured', true)
      .order('rating', { ascending: false });

    if (error) return localFeatured;
    if (!data || data.length === 0) return localFeatured;
    return data.map(dbProductToLocal);
  } catch {
    return localFeatured;
  }
}

/** Obtiene un producto por su slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    const local = localGetBySlug(slug);
    return local ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (error || !data) {
      return localGetBySlug(slug) ?? null;
    }
    return dbProductToLocal(data as ProductDB & Record<string, unknown>);
  } catch {
    return localGetBySlug(slug) ?? null;
  }
}

/** Obtiene productos por categoría (slug de categoría) */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return localGetByCategory(categorySlug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('active', true)
      .eq('category.slug', categorySlug)
      .order('created_at', { ascending: false });

    if (error) return localGetByCategory(categorySlug);
    return withFallback(data, localGetByCategory(categorySlug));
  } catch {
    return localGetByCategory(categorySlug);
  }
}

/** Obtiene productos por subcategoría (slug de subcategoría) */
export async function getProductsBySubcategory(subcategorySlug: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return localGetBySubcategory(subcategorySlug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('active', true)
      .eq('subcategory', subcategorySlug)
      .order('created_at', { ascending: false });

    if (error) return localGetBySubcategory(subcategorySlug);
    return withFallback(data, localGetBySubcategory(subcategorySlug));
  } catch {
    return localGetBySubcategory(subcategorySlug);
  }
}

/** Obtiene todos los slugs de productos activos (para generateStaticParams) */
export async function getAllProductSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return localAllProducts.map(p => p.slug);

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('active', true);

    if (error || !data || data.length === 0) return localAllProducts.map(p => p.slug);
    return data.map(p => p.slug);
  } catch {
    return localAllProducts.map(p => p.slug);
  }
}
