import {
  createTripMarketplaceListing,
} from "./trip-marketplace";

const listing = createTripMarketplaceListing({
  carrierId: "traveler-001",
  carrierType: "traveler",

  origin: "Makurdi",
  destination: "Abuja",

  departureTime: new Date().toISOString(),

  availableWeightKg: 15,
  availablePackageCount: 2,

  estimatedEarnings: 1955,
  currency: "NGN",

  availability: "available",
});

console.log("Mobility-X Trip Marketplace Test");
console.log("================================");
console.log("Carrier:", listing.carrierType);
console.log("Route:", `${listing.origin} → ${listing.destination}`);
console.log("Available weight:", `${listing.availableWeightKg} kg`);
console.log("Available packages:", listing.availablePackageCount);
console.log("Estimated earnings:", `${listing.currency} ${listing.estimatedEarnings}`);
console.log("Availability:", listing.availability);
console.log("Listing ID:", listing.id);