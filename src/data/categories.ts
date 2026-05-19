import {
  Dumbbell,
  CircleDot,
  Shirt,
  Watch,
  Pill,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "@/data/types";

/**
 * Mapa de slug de categoría → componente icono de Lucide.
 * Se mantiene separado para que las categorías sean serializables
 * y los iconos se resuelvan solo en el cliente.
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
      "Ropa técnica y calzado para correr, entrenar y competir.",
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
