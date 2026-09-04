import type {
  Payment,
  PaymentStatus,
} from "./domain";

export function createPendingPayment(
  deliveryId: string,
  customerId: string,
  amount: number,
  currency: string,
): Payment {
  return {
    id: `payment-${Date.now()}`,
    deliveryId,
    customerId,
    amount,
    currency,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function authorizePayment(
  payment: Payment,
): Payment {
  if (payment.status !== "pending") {
    throw new Error(
      `Payment cannot be authorized from status: ${payment.status}`,
    );
  }

  return {
    ...payment,
    status: "authorized",
  };
}

export function holdPayment(
  payment: Payment,
): Payment {
  if (payment.status !== "authorized") {
    throw new Error(
      `Payment cannot be held from status: ${payment.status}`,
    );
  }

  return {
    ...payment,
    status: "held",
    heldAt: new Date().toISOString(),
  };
}

export function releasePayment(
  payment: Payment,
): Payment {
  if (payment.status !== "held") {
    throw new Error(
      `Payment cannot be released from status: ${payment.status}`,
    );
  }

  return {
    ...payment,
    status: "released",
    releasedAt: new Date().toISOString(),
  };
}

export function refundPayment(
  payment: Payment,
): Payment {
  if (
    payment.status !== "held" &&
    payment.status !== "authorized"
  ) {
    throw new Error(
      `Payment cannot be refunded from status: ${payment.status}`,
    );
  }

  return {
    ...payment,
    status: "refunded",
    refundedAt: new Date().toISOString(),
  };
}

export function canReleasePayment(
  status: PaymentStatus,
): boolean {
  return status === "held";
}