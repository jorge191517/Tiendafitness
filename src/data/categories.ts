import {
  Dumbbell,
  CircleDot,
  Shirt,
  Watch,
  Pill,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory, ProductSubcategory } from "@/data/types";

/**
 * Mapa de slug de categoría → componente icono de Lucide.
 * Se mantiene separado para que las categorías sean serializables
 * y los iconos se resuelven solo en el cliente.
 */
export const categoryIcons: Record<string, LucideIcon> = {
  "fitness-gym": Dumbbell,
  padel: CircleDot,
  "ropa-deportiva": Shirt,
  accesorios: Watch,
  suplementos: Pill,
};

/**
 * Datos de categorías. NO contiene productos.
 * Para añadir una categoría nueva, basta con agregar un objeto aquí
 * y registrar su icono en `categoryIcons`.
 */
export const categories: ProductCategory[] = [
  {
    id: 1,
    name: "Fitness y Gym",
    slug: "fitness-gym",
    icon: "Dumbbell",
    description:
      "Equipamiento profesional para tu gimnasio: pesas, bandas, máquinas y más.",
  },
  {
    id: 2,
    name: "Pádel",
    slug: "padel",
    icon: "CircleDot",
    description:
      "Palas, bolas y accesorios de pádel seleccionados para todos los niveles.",
  },
  {
    id: 3,
    name: "Ropa Deportiva",
    slug: "ropa-deportiva",
    icon: "Shirt",
    description:
      "Ropa técnica y conjuntos deportivos seleccionados para entrenar con estilo y comodidad.",
  },
  {
    id: 4,
    name: "Accesorios",
    slug: "accesorios",
    icon: "Watch",
    description:
      "Relojes inteligentes, pulsómetros y complementos deportivos.",
  },
  {
    id: 5,
    name: "Suplementos",
    slug: "suplementos",
    icon: "Pill",
    description:
      "Proteínas, BCAAs, vitaminas y suplementos para maximizar tu rendimiento.",
  },
];

/**
 * Subcategorías de productos.
 * Cada subcategoría pertenece a una categoría padre.
 */
export const subcategories: ProductSubcategory[] = [
  {
    slug: "conjuntos-deportivos-dama",
    name: "Conjuntos Deportivos Dama",
    parentCategory: "ropa-deportiva",
  },
  {
    slug: "shorts-deportivos-caballero",
    name: "Shorts Deportivos Caballero",
    parentCategory: "ropa-deportiva",
  },
];

/** Devuelve las subcategorías de una categoría padre */
export function getSubcategories(categorySlug: string): ProductSubcategory[] {
  return subcategories.filter((s) => s.parentCategory === categorySlug);
}
