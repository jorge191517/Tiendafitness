import type { Product } from "@/data/types";

export const fitnessGymProducts: Product[] = [
  {
    id: 1, name: "Set de Bandas de Resistencia Pro", slug: "set-bandas-resistencia-pro", category: "fitness-gym",
    description: "Set completo de 5 bandas de resistencia con diferentes niveles de tensión. Ideales para entrenamiento funcional, rehabilitación y fuerza en casa.",
    price: 29.99, oldPrice: 49.99, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop",
    rating: 4.8, reviews: 324, badge: "OFERTA", featured: true, stock: "in_stock",
    variants: [{ id: 1001, colorName: "Estándar", color: "#FF6B35", image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop", sizes: [], stock: "in_stock" }],
  },
  {
    id: 7, name: "Set de Mancuernas Ajustables 24kg", slug: "set-mancuernas-ajustables-24kg", category: "fitness-gym",
    description: "Mancuernas ajustables de 2 a 24 kg con sistema de cambio rápido. Ahorra espacio y entrena con la intensidad que necesites.",
    price: 199.99, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    rating: 4.8, reviews: 445, badge: "TOP VALORADO", featured: true, stock: "in_stock",
    variants: [{ id: 1002, colorName: "Estándar", color: "#333333", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop", sizes: [], stock: "in_stock" }],
  },
];
