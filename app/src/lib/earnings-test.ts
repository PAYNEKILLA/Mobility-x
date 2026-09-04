import { calculateEarnings } from "./earnings";

const result = calculateEarnings({
  baseFare: 1000,
  distanceKm: 10,
  detourDistanceKm: 0,
  packageWeightKg: 2,
});

console.log("Mobility-X Earnings Test");
console.log("-------------------------");
console.log(
  "Gross earnings:",
  `₦${result.grossEarnings.toLocaleString()}`,
);
console.log(
  "Platform fee:",
  `₦${result.platformFee.toLocaleString()}`,
);
console.log(
  "Partner earnings:",
  `₦${result.partnerEarnings.toLocaleString()}`,
);
console.log("Currency:", result.currency);