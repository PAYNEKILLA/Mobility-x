import type {
  Trip,
  Package,
  Delivery,
  Vehicle,
  Payment,
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
  createPendingPayment,
} from "./payments/escrow";

export type BookingRequest = {
  trip: Trip;
  package: Package;
  delivery: {
    customerId: string;
    packageId: string;
    pickup: Delivery["pickup"];
    destination: Delivery["destination"];
    option: Delivery["option"];
    status: Delivery["status"];
    currency: string;
  };
  vehicle: Vehicle;
};

export type BookingResult = {
  accepted: boolean;
  match: MatchingResult;
  delivery?: Delivery;
  earnings?: EarningsResult;
  payment?: Payment;
  reason?: string;
};

export function createBooking(
  request: BookingRequest,
): BookingResult {
  const {
    trip,
    package: packageData,
    vehicle,
  } = request;

  const delivery: Delivery = {
    id: crypto.randomUUID(),
    customerId: request.delivery.customerId,
    packageId: packageData.id,
    pickup: request.delivery.pickup,
    destination: request.delivery.destination,
    option: request.delivery.option,
    status: request.delivery.status,
    paymentStatus: "pending",
    currency: request.delivery.currency,
    createdAt: new Date().toISOString(),
  };

  const match = calculateMatch({
    trip,
    delivery,
    package: packageData,
    vehicle,
  });

  if (!match.eligible) {
    return {
      accepted: false,
      match,
      delivery,
      reason: "No compatible match found",
    };
  }

  const earnings = calculateEarnings({
    baseFare: 1000,
    distanceKm:
      match.detourDistanceKm === 0
        ? 10
        : match.detourDistanceKm,
    detourDistanceKm: match.detourDistanceKm,
    packageWeightKg: packageData.weightKg,
  });

  const payment = createPendingPayment(
    delivery.id,
    delivery.customerId,
    earnings.grossEarnings,
    delivery.currency,
  );

  return {
    accepted: true,
    match,
    delivery,
    earnings,
    payment,
    reason: "Booking accepted",
  };
}