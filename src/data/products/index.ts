/**
 * Punto de entrada centralizado para todos los productos.
 *
 * Cada categoría tiene su propio archivo de datos; este módulo los
 * agrega y ofrece utilidades de consulta para que los componentes
 * no necesiten conocer la estructura interna de carpetas.
 *
 * USO:
 *   import { featuredProducts, getProductsByCategory, getProductVariants } from "@/data/products";
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
 * Devuelve las variantes de color de un producto.
 * Un producto tiene variantes si su `variantGroup` coincide con otros productos.
 * No incluye al propio producto en el resultado.
 *
 * Ejemplo: "Conjunto Deportivo Dama Mocha" (variantGroup: "conjunto-deportivo-dama")
 * devuelve los otros 3 colores: Negro, Sage, Terracota.
 */
export function getProductVariants(product: Product): Product[] {
  if (!product.variantGroup) return [];
  return allProducts.filter(
    (p) => p.variantGroup === product.variantGroup && p.id !== product.id
  );
}

// ─── Re-export de tipos (comodidad) ─────────────────────────────────────────

export type { Product, ProductBadge, ProductStock } from "@/data/types";
