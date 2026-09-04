import {
  createPendingPayment,
  authorizePayment,
  holdPayment,
} from "./payments/escrow";

import {
  markDeliveryDelivered,
} from "./payment-delivery-workflow";

import type {
  Delivery,
} from "./domain";

const delivery: Delivery = {
  id: "delivery-workflow-001",
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

  option: "standard",
  status: "delivered",
  paymentStatus: "held",
  currency: "NGN",
  createdAt: new Date().toISOString(),
};

const payment = createPendingPayment(
  delivery.id,
  delivery.customerId,
  2400,
  delivery.currency,
);

const authorizedPayment = authorizePayment(payment);
const heldPayment = holdPayment(authorizedPayment);

console.log("Mobility-X Payment Delivery Workflow Test");
console.log("------------------------------------------");
console.log("Delivery:", delivery.status);
console.log("Payment before release request:", heldPayment.status);

const result = markDeliveryDelivered(
  delivery,
  heldPayment,
);

console.log("Delivery after completion:", result.delivery.status);
console.log(
  "Payment after release request:",
  result.payment.status,
);

if (result.payment.status !== "release_pending") {
  throw new Error(
    `Expected release_pending, got ${result.payment.status}`,
  );
}

console.log("Payment delivery integration test passed.");
