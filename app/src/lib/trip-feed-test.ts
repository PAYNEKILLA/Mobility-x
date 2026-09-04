import {
  getTripFeed,
} from "./trip-feed";

import {
  createTripMarketplaceListing,
} from "./trip-marketplace";

const listings = [
  createTripMarketplaceListing({
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
  }),

  createTripMarketplaceListing({
    carrierId: "traveler-002",
    carrierType: "traveler",
    origin: "Makurdi",
    destination: "Lafia",
    departureTime: new Date().toISOString(),
    availableWeightKg: 10,
    availablePackageCount: 1,
    estimatedEarnings: 1200,
    currency: "NGN",
    availability: "available",
  }),

  createTripMarketplaceListing({
    carrierId: "driver-001",
    carrierType: "driver",
    origin: "Abuja",
    destination: "Jos",
    departureTime: new Date().toISOString(),
    availableWeightKg: 50,
    availablePackageCount: 5,
    estimatedEarnings: 3500,
    currency: "NGN",
    availability: "available",
  }),
];

const feed = getTripFeed(
  {
    currentLocation: "Makurdi",
    destination: "Abuja",
  },
  listings,
);

console.log("Mobility-X Trip Feed Test");
console.log("=========================");
console.log("Requested route: Makurdi → Abuja");
console.log("");

feed.forEach((item, index) => {
  console.log(`${index + 1}. ${item.origin} → ${item.destination}`);
  console.log("   Carrier:", item.carrierType);
  console.log("   Match score:", item.matchScore);
  console.log("   Reason:", item.matchReason);
  console.log("   Earnings:", `${item.currency} ${item.estimatedEarnings}`);
  console.log("");
});