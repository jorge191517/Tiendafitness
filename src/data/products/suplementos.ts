import type { Product } from "@/data/types";

export const suplementosProducts: Product[] = [
  {
    id: 4, name: "Proteína Whey Isolate 2kg", slug: "proteina-whey-isolate-2kg", category: "suplementos",
    description: "Proteína de suero aislada de alta pureza con 27g de proteína por toma. Baja en grasas y carbohidratos, sabor premium.",
    price: 59.99, oldPrice: 79.99, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2c989?w=400&h=400&fit=crop",
    rating: 4.6, reviews: 891, badge: "OFERTA", featured: true, stock: "in_stock",
    variants: [{ id: 4001, colorName: "Estándar", color: "#D4A574", image: "https://images.unsplash.com/photo-1593095948071-474c5cc2c989?w=400&h=400&fit=crop", sizes: [], stock: "in_stock" }],
  },
  {
    id: 8, name: "Complejo Recuperador BCAA", slug: "complejo-recuperador-bcaa", category: "suplementos",
    description: "BCAAs en proporción 2:1:1 con glutamina y vitamina B6. Acelera la recuperación y reduce la fatiga muscular.",
    price: 34.99, image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
    rating: 4.4, reviews: 156, featured: true, stock: "in_stock",
    variants: [{ id: 8001, colorName: "Estándar", color: "#4A90D9", image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop", sizes: [], stock: "in_stock" }],
  },
];
