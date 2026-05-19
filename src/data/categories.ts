import {
  Shirt,
  Watch,
  Dumbbell,
  CircleDot,
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
  "ropa-deportiva": Shirt,
  accesorios: Watch,
  "fitness-gym": Dumbbell,
  padel: CircleDot,
  suplementos: Pill,
};

/**
 * Datos de categorías. NO contiene productos.
 * Solo se muestran las categorías que tienen productos reales.
 * Las categorías vacías se incluyen para navegación pero se
 * ocultan en el frontend si no hay productos.
 */
export const categories: ProductCategory[] = [
  {
    id: 1,
    name: "Ropa Deportiva",
    slug: "ropa-deportiva",
    icon: "Shirt",
    description:
      "Ropa técnica y conjuntos deportivos seleccionados para entrenar con estilo y comodidad.",
  },
  {
    id: 2,
    name: "Accesorios",
    slug: "accesorios",
    icon: "Watch",
    description:
      "Shakers, complementos y accesorios deportivos para tu día a día.",
  },
  {
    id: 3,
    name: "Fitness y Gym",
    slug: "fitness-gym",
    icon: "Dumbbell",
    description:
      "Equipamiento profesional para tu gimnasio: pesas, bandas, máquinas y más.",
  },
  {
    id: 4,
    name: "Pádel",
    slug: "padel",
    icon: "CircleDot",
    description:
      "Palas, bolas y accesorios de pádel seleccionados para todos los niveles.",
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
  {
    slug: "franelas-deportivas-caballero",
    name: "Franelas Deportivas Caballero",
    parentCategory: "ropa-deportiva",
  },
  {
    slug: "shakers-deportivos",
    name: "Shakers Deportivos",
    parentCategory: "accesorios",
  },
];

/** Devuelve las subcategorías de una categoría padre */
export function getSubcategories(categorySlug: string): ProductSubcategory[] {
  return subcategories.filter((s) => s.parentCategory === categorySlug);
}
