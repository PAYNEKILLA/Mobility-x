import type { Package } from "../domain";

export const packages: Package[] = [
  {
    id: "package-001",
    category: "standard",
    weightKg: 10,
    lengthCm: 40,
    widthCm: 30,
    heightCm: 25,
    description: "General household package",
  },

  {
    id: "package-002",
    category: "fragile",
    weightKg: 5,
    lengthCm: 35,
    widthCm: 25,
    heightCm: 20,
    description: "Fragile electronics",
  },

  {
    id: "package-003",
    category: "high_value",
    weightKg: 8,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
    description: "High-value item",
  },
];
