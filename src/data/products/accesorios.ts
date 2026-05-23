import type { Product } from "@/data/types";

export const accesoriosProducts: Product[] = [
  {
    id: 104,
    name: "Shaker Deportivo",
    slug: "shaker-deportivo",
    category: "accesorios",
    description: "Shaker deportivo de 700ml con sistema de mezcla premium sin grumos. Fabricado en material libre de BPA, resistente a impactos y apto para lavavajillas.",
    price: 12.99,
    oldPrice: 17.99,
    image: "/images/products/ShakerGris.png",
    rating: 4.7,
    reviews: 267,
    badge: "OFERTA",
    featured: true,
    stock: "in_stock",
    variants: [
      { id: 1041, colorName: "Gris", color: "#808080", image: "/images/products/ShakerGris.png", sizes: [], stock: "in_stock" },
      { id: 1042, colorName: "Negro", color: "#1A1A1A", image: "/images/products/ShakerNegro.png", sizes: [], stock: "in_stock" },
      { id: 1043, colorName: "Rosa", color: "#E8A0BF", image: "/images/products/ShakerRosa.png", sizes: [], stock: "in_stock" },
      { id: 1044, colorName: "Transparente", color: "#D4E8E0", image: "/images/products/ShakerTransparente.png", sizes: [], stock: "in_stock" },
    ],
  },
];
