/**
 * Punto de entrada centralizado para todos los productos.
 *
 * Cada categoría tiene su propio archivo de datos; este módulo los
 * agrega y ofrece utilidades de consulta para que los componentes
 * no necesiten conocer la estructura interna de carpetas.
 *
 * USO:
 *   import { featuredProducts, getProductsByCategory } from "@/data/products";
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

/** Busca un producto por su slug (devuelve undefined si no existe) */
export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((p) => p.slug === slug);
}

// ─── Re-export de tipos (comodidad) ─────────────────────────────────────────

export type { Product, ProductBadge, ProductStock } from "@/data/types";
