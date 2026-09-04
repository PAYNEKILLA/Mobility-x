import type {
  Delivery,
  Package,
  Payment,
  Trip,
  Vehicle,
} from "./domain";

import {
  calculateMatch,
  type MatchingResult,
} from "./matching";

import {
  calculateEarnings,
  type EarningsResult,
} from "./earnings";

import {
  createDelivery,
} from "./deliveries";

import {
  createPendingPayment,
} from "./payments/escrow";

export type BookingServiceInput = {
  customerId: string;
  package: Package;

  pickup: Delivery["pickup"];
  destination: Delivery["destination"];

  option: Delivery["option"];
  currency: string;

  requestedPickupTime?: string;
  deliveryDeadline?: string;

  trip: Trip;
  vehicle: Vehicle;
};

export type BookingServiceResult = {
  accepted: boolean;

  delivery?: Delivery;

  match: MatchingResult;

  earnings?: EarningsResult;

  payment?: Payment;

  reason: string;
};

export function createBookingService(
  input: BookingServiceInput,
): BookingServiceResult {
  const deliveryDraft: Omit<
    Delivery,
    "id" | "createdAt"
  > = {
    customerId: input.customerId,

    packageId: input.package.id,

    pickup: input.pickup,

    destination: input.destination,

    option: input.option,

    status: "pickup_pending",

    paymentStatus: "pending",

    requestedPickupTime:
      input.requestedPickupTime,

    deliveryDeadline:
      input.deliveryDeadline,

    currency: input.currency,
  };

  const delivery: Delivery =
    createDelivery(deliveryDraft);

  const match = calculateMatch({
    trip: input.trip,
    delivery,
    package: input.package,
    vehicle: input.vehicle,
  });

  if (!match.eligible) {
    return {
      accepted: false,
      delivery,
      match,
      reason:
        "No compatible trip was found for this delivery.",
    };
  }

  const earnings = calculateEarnings({
    baseFare: 1000,

    distanceKm:
      match.detourDistanceKm === 0
        ? 10
        : match.detourDistanceKm,

    detourDistanceKm:
      match.detourDistanceKm,

    packageWeightKg:
      input.package.weightKg,
  });

  const payment =
    createPendingPayment(
      delivery.id,
      input.customerId,
      earnings.grossEarnings,
      input.currency,
    );

  return {
    accepted: true,

    delivery,

    match,

    earnings,

    payment,

    reason:
      "Booking created successfully.",
  };
}