export type PackageSize = "small" | "medium" | "large";

export type PackageSizeOption = {
  size: PackageSize;
  label: string;
  description: string;
  maxWeightKg: number;
};

export const PACKAGE_SIZE_OPTIONS: PackageSizeOption[] = [
  {
    size: "small",
    label: "Small",
    description: "Documents, envelopes, and small parcels",
    maxWeightKg: 5,
  },
  {
    size: "medium",
    label: "Medium",
    description: "Backpack, shoebox, or medium-sized parcels",
    maxWeightKg: 15,
  },
  {
    size: "large",
    label: "Large",
    description: "Large parcels requiring more carrying space",
    maxWeightKg: 30,
  },
];

export function getPackageSizeOption(
  size: PackageSize,
): PackageSizeOption {
  const option = PACKAGE_SIZE_OPTIONS.find(
    (item) => item.size === size,
  );

  if (!option) {
    throw new Error(`Unsupported package size: ${size}`);
  }

  return option;
}

export function isPackageWeightAllowed(
  size: PackageSize,
  weightKg: number,
): boolean {
  const option = getPackageSizeOption(size);

  return weightKg > 0 && weightKg <= option.maxWeightKg;
}