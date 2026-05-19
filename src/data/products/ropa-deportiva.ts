import type { Product } from "@/data/types";

/**
 * Productos de la categoría Ropa Deportiva.
 * Para añadir productos nuevos, simplemente agrégalos a este array.
 */
export const ropaDeportivaProducts: Product[] = [
  {
    id: 3,
    name: "Zapatillas de Running Ultra Comfort",
    slug: "zapatillas-running-ultra-comfort",
    category: "ropa-deportiva",
    description:
      "Zapatillas de running con amortiguación premium y suela flexible. Diseñadas para largas distancias con máxima comodidad.",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 512,
    featured: true,
    stock: "in_stock",
  },
  {
    id: 6,
    name: "Pantalones de Compresión Training",
    slug: "pantalones-compresion-training",
    category: "ropa-deportiva",
    description:
      "Pantalones de compresión con tecnología Dry-Fit que absorbe el sudor. Soporte muscular y libertad de movimiento total.",
    price: 44.99,
    oldPrice: 64.99,
    image:
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 198,
    badge: "OFERTA",
    featured: true,
    stock: "in_stock",
  },
];
