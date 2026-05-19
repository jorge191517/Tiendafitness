import {
  Dumbbell,
  CircleDot,
  Shirt,
  Watch,
  Pill,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  slug: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Fitness y Gym",
    icon: Dumbbell,
    slug: "fitness-gym",
  },
  {
    id: 2,
    name: "Pádel",
    icon: CircleDot,
    slug: "padel",
  },
  {
    id: 3,
    name: "Ropa Deportiva",
    icon: Shirt,
    slug: "ropa-deportiva",
  },
  {
    id: 4,
    name: "Accesorios",
    icon: Watch,
    slug: "accesorios",
  },
  {
    id: 5,
    name: "Suplementos",
    icon: Pill,
    slug: "suplementos",
  },
];
