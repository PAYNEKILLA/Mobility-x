import { calculateMatch } from "./matching";

const result = calculateMatch({
  trip: {
    id: "trip-reject-001",
    partnerId: "partner-001",
    vehicleId: "vehicle-001",
    origin: {
      address: "Makurdi",
      coordinates: { latitude: 7.7322, longitude: 8.5391 },
    },
    destination: {
      address: "Abuja",
      coordinates: { latitude: 9.0765, longitude: 7.3986 },
    },
    departureTime: "2026-08-05T07:00:00Z",
    estimatedArrivalTime: "2026-08-05T12:00:00Z",
    availablePackageCount: 2,
    availableWeightKg: 5,
    acceptedCategories: ["standard"],
    status: "published",
  },

  delivery: {
    id: "delivery-reject-001",
    customerId: "customer-001",
    packageId: "package-reject-001",
    pickup: {
      address: "Makurdi",
      coordinates: { latitude: 7.7322, longitude: 8.5391 },
    },
    destination: {
      address: "Abuja",
      coordinates: { latitude: 9.0765, longitude: 7.3986 },
    },
    option: "standard",
    status: "matching",
    paymentStatus: "pending",
    currency: "NGN",
    createdAt: "2026-08-05T06:00:00Z",
  },

  package: {
    id: "package-reject-001",
    category: "standard",
    weightKg: 50,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
    description: "Oversized weight test",
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

console.log("Mobility-X Matching Rejection Test");
console.log("----------------------------------");
console.log("Eligible:", result.eligible);
console.log("Compatibility:", `${result.compatibilityScore}%`);
console.log("Capacity:", result.explanation.capacity);
console.log("Vehicle:", result.explanation.vehicle);
console.log("Route:", result.explanation.route);
console.log("Time:", result.explanation.time);

