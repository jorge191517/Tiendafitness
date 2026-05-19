import type { Product } from "@/data/types";

/**
 * Productos de la categoría Ropa Deportiva.
 *
 * Estructura: producto base con variantes de color.
 * En catálogo se muestra 1 card por producto base.
 * En detalle se elige color y talla.
 *
 * Para añadir productos nuevos, agrégalos a este array.
 */
export const ropaDeportivaProducts: Product[] = [
  // ─── Conjunto Deportivo Dama ──────────────────────────────────────────────
  {
    id: 1,
    name: "Conjunto Deportivo Dama",
    slug: "conjunto-deportivo-dama",
    category: "ropa-deportiva",
    categoryName: "Ropa Deportiva",
    subcategory: "conjuntos-deportivos-dama",
    subcategoryName: "Conjuntos Deportivos Dama",
    variantGroup: "conjunto-deportivo-dama",
    description:
      "Conjunto deportivo de dama con tejido suave y elástico que se adapta a tu cuerpo para máxima comodidad durante el entrenamiento. Corte ergonómico con cintura alta y costuras planas que evitan roces. Tela transpirable de secado rápido para un rendimiento óptimo en cada sesión. Diseño moderno y favorecedor, ideal para gym, yoga o uso casual deportivo.",
    price: 39.99,
    image: "/images/products/ConjuntoMocha.png",
    rating: 5.0,
    reviews: 0,
    badge: "NUEVO",
    featured: true,
    stock: "in_stock",
    sizes: ["S", "M", "L"],
    color: "#A0785A",
    colorName: "Mocha",
    variants: [
      {
        id: 101,
        color: "#A0785A",
        colorName: "Mocha",
        image: "/images/products/ConjuntoMocha.png",
        sizes: ["S", "M", "L"],
        stock: "in_stock",
      },
      {
        id: 102,
        color: "#1A1A1A",
        colorName: "Negro",
        image: "/images/products/ConjuntoNegro.png",
        sizes: ["S", "M", "L"],
        stock: "in_stock",
      },
      {
        id: 103,
        color: "#8A9A5B",
        colorName: "Verde Sage",
        image: "/images/products/ConjuntoSage.png",
        sizes: ["S", "M", "L"],
        stock: "in_stock",
      },
      {
        id: 104,
        color: "#C66B3D",
        colorName: "Terracota",
        image: "/images/products/ConjuntoTerracota.png",
        sizes: ["S", "M", "L"],
        stock: "in_stock",
      },
    ],
  },

  // ─── Short Deportivo Caballero ────────────────────────────────────────────
  {
    id: 2,
    name: "Short Deportivo Caballero",
    slug: "short-deportivo-caballero",
    category: "ropa-deportiva",
    categoryName: "Ropa Deportiva",
    subcategory: "shorts-deportivos-caballero",
    subcategoryName: "Shorts Deportivos Caballero",
    variantGroup: "short-deportivo-caballero",
    description:
      "Short deportivo de caballero confeccionado en tela ligera y transpirable con cintura elástica ajustable. Tejido técnico de secado rápido que elimina la humedad y mantiene el frescor. Corte atlético con diseño cómodo y bolsillos laterales. Ideal para running, gym y entrenamiento funcional con máxima movilidad.",
    price: 24.99,
    image: "/images/products/ShortsNegro.png",
    rating: 5.0,
    reviews: 0,
    badge: "NUEVO",
    featured: true,
    stock: "in_stock",
    sizes: ["S", "M", "L", "XL"],
    color: "#1A1A1A",
    colorName: "Negro",
    variants: [
      {
        id: 201,
        color: "#808080",
        colorName: "Gris",
        image: "/images/products/ShortsGris.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 202,
        color: "#A0785A",
        colorName: "Mocha",
        image: "/images/products/ShortsMocha.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 203,
        color: "#1B2A4A",
        colorName: "Azul Navy",
        image: "/images/products/ShortsNavy.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 204,
        color: "#1A1A1A",
        colorName: "Negro",
        image: "/images/products/ShortsNegro.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 205,
        color: "#556B2F",
        colorName: "Verde Olive",
        image: "/images/products/ShortsOlive.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
    ],
  },

  // ─── Franela Deportiva Caballero ──────────────────────────────────────────
  {
    id: 3,
    name: "Franela Deportiva Caballero",
    slug: "franela-deportiva-caballero",
    category: "ropa-deportiva",
    categoryName: "Ropa Deportiva",
    subcategory: "franelas-deportivas-caballero",
    subcategoryName: "Franelas Deportivas Caballero",
    variantGroup: "franela-deportiva-caballero",
    description:
      "Franela deportiva de caballero con diseño moderno y versátil. Tejido transpirable que combina estilo y funcionalidad para entrenamiento o uso casual. Corte cómodo con ajuste atlético que permite libertad de movimiento total. Perfecta para gym, actividades al aire libre o como prenda de uso diario.",
    price: 19.99,
    image: "/images/products/camisa.png",
    rating: 5.0,
    reviews: 0,
    badge: "NUEVO",
    featured: true,
    stock: "in_stock",
    sizes: ["S", "M", "L", "XL"],
    color: "#1A1A1A",
    colorName: "Negro/Azul",
    variants: [
      {
        id: 301,
        color: "#1A1A1A",
        colorName: "Negro/Azul",
        image: "/images/products/camisa.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 302,
        color: "#1B2A4A",
        colorName: "Azul/Negro",
        image: "/images/products/FranelaAzulNegro.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
      {
        id: 303,
        color: "#556B2F",
        colorName: "Verde/Negro",
        image: "/images/products/FranelaVerdeNegro.png",
        sizes: ["S", "M", "L", "XL"],
        stock: "in_stock",
      },
    ],
  },
];
