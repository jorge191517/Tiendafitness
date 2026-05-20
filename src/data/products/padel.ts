import type { Product } from "@/data/types";

export const padelProducts: Product[] = [
  {
    id: 2, name: "Pala de Pádel de Carbono Pro", slug: "pala-padel-carbono-pro", category: "padel",
    description: "Pala de pádel fabricada en carbono de alta resistencia con núcleo de goma EVA. Potencia y control en cada golpe.",
    price: 189.99, oldPrice: 249.99, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
    rating: 4.9, reviews: 187, badge: "MÁS VENDIDO", featured: true, stock: "in_stock",
    variants: [{ id: 2001, colorName: "Estándar", color: "#1A1A1A", image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop", sizes: [], stock: "in_stock" }],
  },
];
