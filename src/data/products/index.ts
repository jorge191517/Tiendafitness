/**
 * Punto de entrada centralizado para todos los productos.
 *
 * Cada categoría tiene su propio archivo de datos; este módulo los
 * agrega y ofrece utilidades de consulta para que los componentes
 * no necesiten conocer la estructura interna de carpetas.
 *
 * USO:
 *   import { ALL_PRODUCTS, featuredProducts, getProductsByCategory } from "@/data/products";
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

/**
 * Array unificado con TODOS los productos del catálogo.
 * Usado por checkout/actions.ts para validar slugs y precios.
 */
export const ALL_PRODUCTS: Product[] = [
  ...accesoriosProducts,
  ...fitnessGymProducts,
  ...padelProducts,
  ...ropaDeportivaProducts,
  ...suplementosProducts,
];

/** Alias para compatibilidad con imports existentes */
export const allProducts = ALL_PRODUCTS;

/** Categorías que tienen productos activos */
export const activeCategories: string[] = Array.from(
  new Set(ALL_PRODUCTS.map((product) => product.category))
);

/** Productos marcados como destacados (featured: true) */
export const featuredProducts: Product[] = ALL_PRODUCTS.filter(
  (product) => product.featured === true
);

// ─── Validación de integridad ───────────────────────────────────────────────

/** Verificar que no haya slugs duplicados o productos sin slug (solo en desarrollo) */
if (process.env.NODE_ENV !== "production") {
  const slugs = ALL_PRODUCTS.map((product) => product.slug);
  const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

  if (duplicates.length > 0) {
    console.warn("[Products] Slugs duplicados detectados:", duplicates);
  }

  const missingSlugs = ALL_PRODUCTS.filter(
    (product) => !product.slug || product.slug.trim() === ""
  );

  if (missingSlugs.length > 0) {
    console.warn(
      "[Products] Productos sin slug:",
      missingSlugs.map((product) => product.name)
    );
  }
}

// ─── Utilidades de consulta ─────────────────────────────────────────────────

/** Devuelve los productos de una categoría por su slug */
export function getProductsByCategory(categorySlug: string): Product[] {
  return productsByCategory[categorySlug] ?? [];
}

/** Busca un producto por su slug */
export function getProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((product) => product.slug === slug);
}

/** Devuelve todos los slugs de productos */
export function getAllProductSlugs(): string[] {
  return ALL_PRODUCTS.map((product) => product.slug);
}

/** Devuelve productos por subcategoría si existe el campo */
export function getProductsBySubcategory(subcategorySlug: string): Product[] {
  return ALL_PRODUCTS.filter((product) => product.subcategory === subcategorySlug);
}

/** Devuelve subcategorías únicas con productos */
export function getUniqueSubcategories(): string[] {
  return Array.from(
    new Set(
      ALL_PRODUCTS
        .map((product) => product.subcategory)
        .filter((subcategory): subcategory is string => Boolean(subcategory))
    )
  );
}

// ─── Re-export de tipos ─────────────────────────────────────────────────────

export type {
  Product,
  ProductBadge,
  ProductStock,
  ProductVariant,
} from "@/data/types";