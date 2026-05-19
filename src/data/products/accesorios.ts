import type { Product } from "@/data/types";

/**
 * Productos de la categoría Accesorios.
 * Para añadir productos nuevos, simplemente agrégalos a este array.
 */
export const accesoriosProducts: Product[] = [
  {
    id: 5,
    name: "Reloj Fitness Inteligente X1",
    slug: "reloj-fitness-inteligente-x1",
    category: "accesorios",
    description:
      "Reloj inteligente con GPS integrado, monitor cardíaco 24h y más de 100 modos deportivos. Resistente al agua hasta 50m.",
    price: 249.99,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 267,
    badge: "NUEVO",
    featured: true,
    stock: "in_stock",
  },
];
