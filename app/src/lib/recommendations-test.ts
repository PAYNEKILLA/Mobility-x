import {
  calculateRecommendation,
} from "./recommendations";

console.log("Mobility-X Recommendation Engine Test");
console.log("======================================");

const strongMatch = calculateRecommendation({
  distanceKm: 3,
  routeScore: 95,
  earnings: 1955,
  packageWeightKg: 8,
  carrierCapacityKg: 15,
  timingCompatible: true,
  available: true,
});

console.log("");
console.log("1. Strong match");
console.log("Score:", strongMatch.score);
console.log("Recommended:", strongMatch.recommended);
console.log("Reasons:", strongMatch.reasons.join(", "));

const poorMatch = calculateRecommendation({
  distanceKm: 40,
  routeScore: 20,
  earnings: 1200,
  packageWeightKg: 10,
  carrierCapacityKg: 15,
  timingCompatible: false,
  available: true,
});

console.log("");
console.log("2. Poor match");
console.log("Score:", poorMatch.score);
console.log("Recommended:", poorMatch.recommended);
console.log("Reasons:", poorMatch.reasons.join(", "));

const overweightPackage = calculateRecommendation({
  distanceKm: 2,
  routeScore: 90,
  earnings: 3500,
  packageWeightKg: 25,
  carrierCapacityKg: 15,
  timingCompatible: true,
  available: true,
});

console.log("");
console.log("3. Package exceeds capacity");
console.log("Score:", overweightPackage.score);
console.log("Recommended:", overweightPackage.recommended);
console.log("Reasons:", overweightPackage.reasons.join(", "));