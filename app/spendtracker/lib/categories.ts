import type { CategoryId } from "./types";
import {
  Bus,
  CakeSlice,
  Gamepad2,
  Gift,
  House,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
  color: string;
  deep: string;
}

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food", icon: Utensils, color: "#ffc4e1", deep: "#ff9ecb" },
  { id: "transport", label: "Ride", icon: Bus, color: "#c4d4ff", deep: "#8fb3ff" },
  { id: "games", label: "Games", icon: Gamepad2, color: "#d7c9ff", deep: "#b39af5" },
  { id: "treats", label: "Treats", icon: CakeSlice, color: "#ffd7b0", deep: "#ffb877" },
  { id: "home", label: "Home", icon: House, color: "#bdecd0", deep: "#7fd6a6" },
  { id: "other", label: "Other", icon: Gift, color: "#ffd0d0", deep: "#ff8f8f" },
];

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
