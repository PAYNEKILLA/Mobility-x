import {
  getNearbyFeed,
} from "./nearby-feed";

const listings = [
  {
    id: "delivery-001",
    origin: "Makurdi",
    destination: "Abuja",
    originCoordinates: {
      latitude: 7.7322,
      longitude: 8.5391,
    },
    estimatedEarnings: 1955,
    currency: "NGN",
    routeScore: 100,
  },

  {
    id: "delivery-002",
    origin: "Gbajimba",
    destination: "Abuja",
    originCoordinates: {
      latitude: 7.8167,
      longitude: 8.6167,
    },
    estimatedEarnings: 2400,
    currency: "NGN",
    routeScore: 100,
  },

  {
    id: "delivery-003",
    origin: "Abuja",
    destination: "Kaduna",
    originCoordinates: {
      latitude: 9.0765,
      longitude: 7.3986,
    },
    estimatedEarnings: 3500,
    currency: "NGN",
    routeScore: 100,
  },
];

const userLocation = {
  latitude: 7.7322,
  longitude: 8.5391,
};

const nearbyFeed = getNearbyFeed(
  userLocation,
  listings,
  100,
);

console.log("Mobility-X Nearby Feed Test");
console.log("===========================");
console.log("User location: Makurdi");
console.log("");

nearbyFeed.forEach((item, index) => {
  console.log(`${index + 1}. ${item.origin} → ${item.destination}`);
  console.log("   Distance:", `${item.distanceKm} km`);
  console.log("   Earnings:", `${item.currency} ${item.estimatedEarnings}`);
  console.log("   Recommendation score:", item.recommendation.score);
  console.log("   Recommended:", item.recommendation.recommended);
  console.log(
    "   Reasons:",
    item.recommendation.reasons.join(", "),
  );
  console.log("");
});