import {
  createPendingPayment,
  authorizePayment,
  holdPayment,
  requestRelease,
  releasePayment,
  refundPayment,
} from "./payments/escrow";

console.log("Mobility-X Escrow Test");
console.log("======================");

const payment = createPendingPayment(
  "delivery-001",
  "customer-001",
  2151,
  "NGN",
);

console.log("1. Created:", payment.status);

const authorizedPayment = authorizePayment(payment);

console.log("2. Authorized:", authorizedPayment.status);

const heldPayment = holdPayment(authorizedPayment);

console.log("3. Held:", heldPayment.status);
console.log("   Held at:", heldPayment.heldAt);

const releasePendingPayment =
  requestRelease(heldPayment);

console.log(
  "4. Release pending:",
  releasePendingPayment.status,
);

const releasedPayment =
  releasePayment(releasePendingPayment);

console.log("5. Released:", releasedPayment.status);
console.log("   Released at:", releasedPayment.releasedAt);

const secondPayment = createPendingPayment(
  "delivery-002",
  "customer-002",
  3000,
  "NGN",
);

const authorizedSecondPayment =
  authorizePayment(secondPayment);

const heldSecondPayment =
  holdPayment(authorizedSecondPayment);

const refundedPayment =
  refundPayment(heldSecondPayment);

console.log("6. Refund path:", refundedPayment.status);
console.log("   Refunded at:", refundedPayment.refundedAt);

console.log("Escrow lifecycle test completed.");