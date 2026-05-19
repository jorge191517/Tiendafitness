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
    name: "Fitness & Gym",
    icon: Dumbbell,
    slug: "fitness-gym",
  },
  {
    id: 2,
    name: "Padel",
    icon: CircleDot,
    slug: "padel",
  },
  {
    id: 3,
    name: "Sportswear",
    icon: Shirt,
    slug: "sportswear",
  },
  {
    id: 4,
    name: "Accessories",
    icon: Watch,
    slug: "accessories",
  },
  {
    id: 5,
    name: "Supplements",
    icon: Pill,
    slug: "supplements",
  },
];
