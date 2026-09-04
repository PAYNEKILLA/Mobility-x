import { createBooking } from "./booking";

import {
  authorizePayment,
  holdPayment,
  requestRelease,
  releasePayment,
} from "./payments/escrow";
import type {
  Trip,
  Package,
  Vehicle,
  Delivery,
} from "./domain";

const trip: Trip = {
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

  departureTime: new Date().toISOString(),

  availablePackageCount: 5,
  availableWeightKg: 100,

  acceptedCategories: ["standard", "fragile"],

  status: "published",
};

const packageData: Package = {
  id: "package-001",
  category: "standard",
  weightKg: 10,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 15,
  description: "Test package",
};

const vehicle: Vehicle = {
  id: "vehicle-001",
  ownerId: "partner-001",
  type: "van",
  make: "Toyota",
  model: "Hiace",
  registrationNumber: "TEST-001",
  maxWeightKg: 500,
  maxPackageCount: 10,
  verificationStatus: "verified",
};

const delivery: Omit<Delivery, "id" | "createdAt"> = {
  customerId: "customer-001",
  packageId: packageData.id,

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

  option: "standard",
  status: "pickup_pending",
  paymentStatus: "pending",
  currency: "NGN",
};

const result = createBooking({
  trip,
  package: packageData,
  vehicle,
  delivery,
});

console.log("Mobility-X Booking Test");
console.log("=======================");
console.log("Accepted:", result.accepted);
console.log("Reason:", result.reason);
console.log("Match:", result.match);
console.log("Booking Result:", result);
if (result.payment) {
  console.log("");
  console.log("Mobility-X Booking Payment Lifecycle");
  console.log("====================================");

  const authorizedPayment = authorizePayment(result.payment);

  console.log(
    "1. Authorized:",
    authorizedPayment.status,
  );

  const heldPayment = holdPayment(authorizedPayment);

  console.log(
    "2. Held:",
    heldPayment.status,
  );

  const releasePendingPayment =
    requestRelease(heldPayment);

  console.log(
    "3. Release pending:",
    releasePendingPayment.status,
  );

  const releasedPayment =
    releasePayment(releasePendingPayment);

  console.log(
    "4. Released:",
    releasedPayment.status,
  );

  console.log(
    "Payment lifecycle completed.",
  );
}