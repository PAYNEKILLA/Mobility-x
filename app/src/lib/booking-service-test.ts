import { createBookingService } from "./booking-service";
import { trips } from "./data/trips";
import { vehicles } from "./data/vehicles";

const trip = trips[0];
const vehicle = vehicles[0];

const packageData = {
  id: "package-service-test",
  category: "standard" as const,
  weightKg: 2,
  lengthCm: 30,
  widthCm: 20,
  heightCm: 15,
  description: "Test package",
};

const result = createBookingService({
  customerId: "customer-service-test",

  package: packageData,

  pickup: {
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

  option: "standard",

  currency: "NGN",

  trip,

  vehicle,
});

console.log("Mobility-X Booking Service Test");
console.log("================================");

console.log("Accepted:", result.accepted);
console.log("Reason:", result.reason);

console.log("");
console.log("Match:");
console.log(result.match);

console.log("");
console.log("Delivery:");
console.log(result.delivery);

console.log("");
console.log("Earnings:");
console.log(result.earnings);

console.log("");
console.log("Payment:");
console.log(result.payment);

if (!result.accepted) {
  throw new Error(
    "Expected booking service to accept the compatible trip.",
  );
}

if (!result.delivery) {
  throw new Error(
    "Expected booking service to create a delivery.",
  );
}

if (!result.earnings) {
  throw new Error(
    "Expected booking service to calculate earnings.",
  );
}

if (!result.payment) {
  throw new Error(
    "Expected booking service to create a pending payment.",
  );
}

if (result.payment.status !== "pending") {
  throw new Error(
    `Expected payment status pending, got ${result.payment.status}`,
  );
}

console.log("");
console.log("Booking service integration test passed.");