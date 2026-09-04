import {
  PACKAGE_SIZE_OPTIONS,
  getPackageSizeOption,
  isPackageWeightAllowed,
} from "./package-options";

console.log("Mobility-X Package Options Test");
console.log("================================");

for (const option of PACKAGE_SIZE_OPTIONS) {
  console.log(
    `${option.label}: up to ${option.maxWeightKg} kg — ${option.description}`,
  );
}

console.log("");
console.log("Medium package, 10 kg:");
console.log(
  isPackageWeightAllowed("medium", 10)
    ? "Allowed"
    : "Not allowed",
);

console.log("");
console.log("Small package, 8 kg:");
console.log(
  isPackageWeightAllowed("small", 8)
    ? "Allowed"
    : "Not allowed",
);

console.log("");
console.log("Large package details:");
console.log(getPackageSizeOption("large"));