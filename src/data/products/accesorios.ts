import type { Product } from "@/data/types";

/**
 * Productos de la categoría Accesorios.
 *
 * Estructura: producto base con variantes de color.
 * En catálogo se muestra 1 card por producto base.
 * En detalle se elige color.
 *
 * Para añadir productos nuevos, agrégalos a este array.
 */
export const accesoriosProducts: Product[] = [
  {
    id: 4,
    name: "Shaker Deportivo",
    slug: "shaker-deportivo",
    category: "accesorios",
    categoryName: "Accesorios",
    subcategory: "shakers-deportivos",
    subcategoryName: "Shakers Deportivos",
    variantGroup: "shaker-deportivo",
    description:
      "Shaker deportivo de 600 ml con diseño ergonómico y sistema de mezcla eficiente. Fabricado en materiales libres de BPA, resistente y fácil de limpiar. Perfecto para batidos de proteínas, bebidas deportivas o hidratación diaria. Cierre herético que evita derrames durante el transporte.",
    price: 9.99,
    image: "/images/products/ShakerNegro.png",
    rating: 5.0,
    reviews: 0,
    badge: "NUEVO",
    featured: true,
    stock: "in_stock",
    // No sizes for shaker
    color: "#1A1A1A",
    colorName: "Negro",
    variants: [
      {
        id: 401,
        color: "#808080",
        colorName: "Gris",
        image: "/images/products/ShakerGris.png",
        stock: "in_stock",
      },
      {
        id: 402,
        color: "#1A1A1A",
        colorName: "Negro",
        image: "/images/products/ShakerNegro.png",
        stock: "in_stock",
      },
      {
        id: 403,
        color: "#E8A0BF",
        colorName: "Rosa",
        image: "/images/products/ShakerRosa.png",
        stock: "in_stock",
      },
      {
        id: 404,
        color: "#D4E8DC",
        colorName: "Transparente",
        image: "/images/products/ShakerTransparente.png",
        stock: "in_stock",
      },
    ],
  },
];
