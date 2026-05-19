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

/** Producto del catálogo */
export interface Product {
  /** Identificador único */
  id: number;
  /** Nombre visible del producto */
  name: string;
  /** Slug URL-friendly (ej. "set-bandas-resistencia-pro") */
  slug: string;
  /** Slug de la categoría a la que pertenece (ej. "fitness-gym") */
  category: string;
  /** Descripción breve del producto */
  description: string;
  /** Precio actual en euros */
  price: number;
  /** Precio anterior (tachado) si hay descuento */
  oldPrice?: number;
  /** URL de la imagen principal */
  image: string;
  /** Valoración media (0-5) */
  rating: number;
  /** Número total de reseñas */
  reviews: number;
  /** Etiqueta destacada opcional */
  badge?: ProductBadge;
  /** Si el producto debe aparecer como destacado */
  featured?: boolean;
  /** Estado de stock del producto */
  stock?: ProductStock;
}

/** Categoría de productos */
export interface ProductCategory {
  /** Identificador único */
  id: number;
  /** Nombre visible de la categoría */
  name: string;
  /** Slug URL-friendly (ej. "fitness-gym") */
  slug: string;
  /** Nombre del componente icono de Lucide (se resuelve en el cliente) */
  icon: string;
  /** Descripción breve de la categoría */
  description?: string;
}
