import type {
  Delivery,
  Payment,
} from "./domain";

import {
  requestRelease,
} from "./payments/escrow";

export type PaymentDeliveryResult = {
  delivery: Delivery;
  payment: Payment;
};

export function markDeliveryDelivered(
  delivery: Delivery,
  payment: Payment,
): PaymentDeliveryResult {
  if (delivery.status === "delivered") {
    throw new Error(
      "Delivery has already been marked as delivered.",
    );
  }

  const updatedDelivery: Delivery = {
    ...delivery,
    status: "delivered",
  };

  const updatedPayment = requestRelease(payment);

  return {
    delivery: updatedDelivery,
    payment: updatedPayment,
  };
}