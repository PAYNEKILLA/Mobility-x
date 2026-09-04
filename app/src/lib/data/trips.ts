import type { Trip } from "../domain";

export const trips: Trip[] = [
  {
    id: "trip-001",
    partnerId: "partner-001",
    vehicleId: "vehicle-001",
    origin: {
      address: "Makurdi, Benue State",
      coordinates: {
        latitude: 7.7322,
        longitude: 8.5391,
      },
    },
    destination: {
      address: "Abuja, FCT",
      coordinates: {
        latitude: 9.0765,
        longitude: 7.3986,
      },
    },
    departureTime: "2026-09-03T14:00:00.000Z",
estimatedArrivalTime: "2026-09-03T21:00:00.000Z",
    availablePackageCount: 3,
    availableWeightKg: 100,
    acceptedCategories: [
      "standard",
      "fragile",
      "high_value",
    ],
    status: "published",
  },

  {
    id: "trip-002",
    partnerId: "partner-002",
    vehicleId: "vehicle-002",
    origin: {
      address: "Gbajimba, Benue State",
      coordinates: {
        latitude: 7.8167,
        longitude: 8.6167,
      },
    },
    destination: {
      address: "Abuja, FCT",
      coordinates: {
        latitude: 9.0765,
        longitude: 7.3986,
      },
    },
    departureTime: "2026-08-22T09:00:00.000Z",
estimatedArrivalTime: "2026-08-22T16:00:00.000Z",
    availablePackageCount: 2,
    availableWeightKg: 60,
    acceptedCategories: [
      "standard",
      "fragile",
    ],
    status: "published",
  },

  {
    id: "trip-003",
    partnerId: "partner-003",
    vehicleId: "vehicle-003",
    origin: {
      address: "Abuja, FCT",
      coordinates: {
        latitude: 9.0765,
        longitude: 7.3986,
      },
    },
    destination: {
      address: "Kaduna, Kaduna State",
      coordinates: {
        latitude: 10.5105,
        longitude: 7.4165,
      },
    },
    departureTime: "2026-08-22T10:00:00.000Z",
estimatedArrivalTime: "2026-08-22T14:00:00.000Z",
    availablePackageCount: 4,
    availableWeightKg: 150,
    acceptedCategories: [
      "standard",
      "fragile",
      "high_value",
    ],
    status: "published",
  },
];
