/**
 * Tipos compartidos para el ecommerce de TiendaFitnessPro.
 *
 * Todas las interfaces de datos se centralizan aquí para evitar
 * duplicidades y garantizar consistencia entre los archivos de
 * productos por categoría y los componentes que los consumen.
 */

/** Badges disponibles para productos */
export type ProductBadge =
  | "OFERTA"
  | "NUEVO"
  | "MÁS VENDIDO"
  | "TOP VALORADO";

/** Estado de stock del producto */
export type ProductStock = "in_stock" | "low_stock" | "out_of_stock";

/** Variante de color de un producto base */
export interface ProductVariant {
  /** Identificador único de la variante */
  id: number;
  /** Color CSS de la variante (ej. "#A0785A") */
  color: string;
  /** Nombre legible del color (ej. "Mocha") */
  colorName: string;
  /** URL de la imagen de esta variante */
  image: string;
  /** Tallas disponibles para esta variante (si difieren de las del producto base) */
  sizes?: string[];
  /** Estado de stock de esta variante */
  stock?: ProductStock;
}

/** Producto del catálogo (producto base con variantes de color) */
export interface Product {
  /** Identificador único del producto base */
  id: number;
  /** Nombre visible del producto base (sin color) */
  name: string;
  /** Slug URL-friendly (ej. "conjunto-deportivo-dama") */
  slug: string;
  /** Slug de la categoría a la que pertenece (ej. "ropa-deportiva") */
  category: string;
  /** Nombre legible de la categoría (ej. "Ropa Deportiva") */
  categoryName?: string;
  /** Slug de la subcategoría (ej. "conjuntos-deportivos-dama") */
  subcategory?: string;
  /** Nombre legible de la subcategoría (ej. "Conjuntos Deportivos Dama") */
  subcategoryName?: string;
  /** Descripción del producto */
  description: string;
  /** Precio actual en euros */
  price: number;
  /** Precio anterior (tachado) si hay descuento */
  oldPrice?: number;
  /** URL de la imagen principal (por defecto la primera variante) */
  image: string;
  /** Valoración media (0-5) */
  rating: number;
  /** Número total de reseñas */
  reviews: number;
  /** Etiqueta destacada opcional */
  badge?: ProductBadge;
  /** Si el producto debe aparecer como destacado */
  featured?: boolean;
  /** Estado de stock general del producto */
  stock?: ProductStock;
  /** Tallas disponibles (unión de todas las variantes) */
  sizes?: string[];
  /** Color principal (de la variante por defecto, para compatibilidad) */
  color?: string;
  /** Nombre del color principal (para compatibilidad) */
  colorName?: string;
  /**
   * Grupo de variantes: identificador compartido por productos
   * que son variaciones de color del mismo modelo.
   * Mantenido para compatibilidad con Supabase.
   */
  variantGroup?: string;
  /** Variantes de color disponibles para este producto */
  variants?: ProductVariant[];
}

/** Categoría de productos */
export interface ProductCategory {
  /** Identificador único */
  id: number;
  /** Nombre visible de la categoría */
  name: string;
  /** Slug URL-friendly (ej. "ropa-deportiva") */
  slug: string;
  /** Nombre del componente icono de Lucide (se resuelve en el cliente) */
  icon: string;
  /** Descripción breve de la categoría */
  description?: string;
}

/** Subcategoría de productos */
export interface ProductSubcategory {
  /** Slug de la subcategoría */
  slug: string;
  /** Nombre legible */
  name: string;
  /** Slug de la categoría padre */
  parentCategory: string;
}
