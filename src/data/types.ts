/**
 * Tipos compartidos para el ecommerce de TiendaFitnessPro.
 */

/** Badges disponibles para productos */
export type ProductBadge = "OFERTA" | "NUEVO" | "MÁS VENDIDO" | "TOP VALORADO";

/** Estado de stock del producto */
export type ProductStock = "in_stock" | "low_stock" | "out_of_stock";

/** Variante de producto (color con su propia imagen y tallas/stock) */
export interface ProductVariant {
  id: number;
  colorName: string;
  color: string;
  image: string;
  sizes: string[];
  stock?: ProductStock;
}

/** Producto del catálogo (modelo base + variantes) */
export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: ProductBadge;
  featured?: boolean;
  stock?: ProductStock;
  variants: ProductVariant[];
}

/** Categoría de productos */
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}
