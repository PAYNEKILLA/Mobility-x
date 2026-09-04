import { calculateMatch } from "./matching";

const result = calculateMatch({
  trip: {
    id: "trip-001",
    partnerId: "partner-001",
    vehicleId: "vehicle-001",

    origin: {
      address: "Makurdi",
      coordinates: {
        latitude: 7.7322,
        longitude: 8.5391,
      },
    },

    destination: {
      address: "Abuja",
      coordinates: {
        latitude: 9.0765,
        longitude: 7.3986,
      },
    },

    departureTime: "2026-08-05T07:00:00Z",
    estimatedArrivalTime: "2026-08-05T12:00:00Z",

    availablePackageCount: 2,
    availableWeightKg: 20,

    acceptedCategories: ["standard", "fragile"],

    status: "published",
  },

  delivery: {
    id: "delivery-001",
    customerId: "customer-001",
    packageId: "package-001",

    pickup: {
      address: "Makurdi",
      coordinates: {
        latitude: 7.7322,
        longitude: 8.5391,
      },
    },

    destination: {
      address: "Abuja",
      coordinates: {
        latitude: 9.0765,
        longitude: 7.3986,
      },
    },

    option: "route_to_earn",
    status: "matching",
    paymentStatus: "pending",

    deliveryDeadline: "2026-08-06T18:00:00Z",

    currency: "NGN",
    createdAt: "2026-08-05T06:00:00Z",
  },

  package: {
    id: "package-001",
    category: "standard",
    weightKg: 2,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
    description: "Standard package",
  },

  vehicle: {
    id: "vehicle-001",
    ownerId: "partner-001",
    type: "car",
    make: "Toyota",
    model: "Camry",
    registrationNumber: "ABC-123",
    maxWeightKg: 100,
    maxPackageCount: 3,
    verificationStatus: "verified",
  },
});

console.log("Mobility-X Matching Engine Test");
console.log("--------------------------------");
console.log("Eligible:", result.eligible);
console.log("Compatibility:", `${result.compatibilityScore}%`);
console.log("Route:", result.explanation.route);
console.log("Time:", result.explanation.time);
console.log("Detour:", `${result.detourDistanceKm} km`);
console.log("Extra time:", `${result.estimatedExtraMinutes} minutes`);
console.log("Capacity:", result.explanation.capacity);
console.log("Vehicle:", result.explanation.vehicle);