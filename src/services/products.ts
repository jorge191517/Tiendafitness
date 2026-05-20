/**
 * Servicio de productos.
 * Lee productos desde Supabase. Fallback a datos locales si:
 * - Supabase no está configurado
 * - Supabase devuelve error
 * - Supabase devuelve array vacío (tabla sin datos)
 */

import { createClient } from '@/lib/supabase/server';
import type { ProductDB } from '@/lib/supabase/types';
import type { Product } from '@/data/types';
import { allProducts as localAllProducts, featuredProducts as localFeatured, getProductsByCategory as localGetByCategory, getProductBySlug as localGetBySlug } from '@/data/products';

/** Convierte un ProductDB de Supabase al tipo Product local */
function dbProductToLocal(p: ProductDB): Product {
  return {
    id: 0,
    name: p.name,
    slug: p.slug,
    category: p.category?.slug ?? '',
    description: p.description ?? '',
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image: p.image_url ?? '',
    rating: Number(p.rating),
    reviews: p.reviews_count,
    badge: p.badge ?? undefined,
    featured: p.featured,
    stock: p.stock_status as Product['stock'],
    variants: [
      {
        id: 1,
        colorName: 'Estándar',
        color: '#808080',
        image: p.image_url ?? '',
        sizes: [],
        stock: p.stock_status as Product['stock'],
      },
    ],
  };
}

/** Verifica si Supabase está configurado */
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Fallback a datos locales si hay error, data null, o data vacío */
function shouldFallbackToLocals(data: unknown[] | null | undefined, error: unknown): boolean {
  return !!error || !data || data.length === 0;
}

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
    if (shouldFallbackToLocals(data, error)) return localAllProducts;
    return data.map(dbProductToLocal);
  } catch { return localAllProducts; }
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
    if (shouldFallbackToLocals(data, error)) return localFeatured;
    return data.map(dbProductToLocal);
  } catch { return localFeatured; }
}

/** Obtiene un producto por su slug */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) { return localGetBySlug(slug) ?? null; }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(slug, name)')
      .eq('slug', slug)
      .eq('active', true)
      .single();
    if (error || !data) { return localGetBySlug(slug) ?? null; }
    return dbProductToLocal(data);
  } catch { return localGetBySlug(slug) ?? null; }
}

/** Obtiene productos por categoría */
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
    if (shouldFallbackToLocals(data, error)) return localGetByCategory(categorySlug);
    return data.map(dbProductToLocal);
  } catch { return localGetByCategory(categorySlug); }
}

/** Obtiene todos los slugs de productos activos */
export async function getAllProductSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return localAllProducts.map(p => p.slug);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('active', true);
    if (shouldFallbackToLocals(data, error)) return localAllProducts.map(p => p.slug);
    return data.map(p => p.slug);
  } catch { return localAllProducts.map(p => p.slug); }
}
