/**
 * Punto de entrada centralizado para todos los productos.
 *
 * Cada categoría tiene su propio archivo de datos; este módulo los
 * agrega y ofrece utilidades de consulta para que los componentes
 * no necesiten conocer la estructura interna de carpetas.
 *
 * USO:
 *   import { allProducts, featuredProducts, getProductBySlug } from "@/data/products";
 */

import type { Product } from "@/data/types";
import { fitnessGymProducts } from "./fitness-gym";
import { padelProducts } from "./padel";
import { ropaDeportivaProducts } from "./ropa-deportiva";
import { accesoriosProducts } from "./accesorios";
import { suplementosProducts } from "./suplementos";

// ─── Agregación ─────────────────────────────────────────────────────────────

/** Productos agrupados por slug de categoría */
export const productsByCategory: Record<string, Product[]> = {
  "fitness-gym": fitnessGymProducts,
  padel: padelProducts,
  "ropa-deportiva": ropaDeportivaProducts,
  accesorios: accesoriosProducts,
  suplementos: suplementosProducts,
};

/** Todos los productos del catálogo en un único array */
export const allProducts: Product[] = Object.values(productsByCategory).flat();

/** Productos marcados como destacados (featured: true) */
export const featuredProducts: Product[] = allProducts.filter(
  (p) => p.featured === true
);

/** Categorías que tienen al menos 1 producto */
export const activeCategories: string[] = Object.entries(productsByCategory)
  .filter(([, products]) => products.length > 0)
  .map(([slug]) => slug);

// ─── Utilidades de consulta ─────────────────────────────────────────────────

/** Devuelve los productos de una categoría por su slug */
export function getProductsByCategory(categorySlug: string): Product[] {
  return productsByCategory[categorySlug] ?? [];
}

/** Devuelve los productos de una subcategoría por su slug */
export function getProductsBySubcategory(subcategorySlug: string): Product[] {
  return allProducts.filter((p) => p.subcategory === subcategorySlug);
}

/** Busca un producto por su slug (devuelve undefined si no existe) */
export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

/** Devuelve todas las subcategorías únicas presentes en los productos */
export function getUniqueSubcategories(categorySlug?: string): { slug: string; name: string; parentCategory: string }[] {
  const source = categorySlug
    ? allProducts.filter((p) => p.category === categorySlug)
    : allProducts;

  const seen = new Set<string>();
  return source
    .filter((p) => p.subcategory && p.subcategoryName)
    .filter((p) => {
      if (seen.has(p.subcategory!)) return false;
      seen.add(p.subcategory!);
      return true;
    })
    .map((p) => ({
      slug: p.subcategory!,
      name: p.subcategoryName!,
      parentCategory: p.category,
    }));
}

/**
 * Busca una variante específica de un producto por su variant ID.
 * Devuelve la variante o undefined si no existe.
 */
export function getVariantById(product: Product, variantId: number): Product["variants"] extends (infer V)[] ? V : never | undefined {
  return product.variants?.find((v) => v.id === variantId) as any;
}

// ─── Re-export de tipos (comodidad) ─────────────────────────────────────────

export type { Product, ProductVariant, ProductBadge, ProductStock } from "@/data/types";
