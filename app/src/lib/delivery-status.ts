export const DELIVERY_STATUSES = [
  "draft",
  "booked",
  "matching",
  "offered",
  "accepted",
  "pickup_pending",
  "picked_up",
  "in_transit",
  "near_destination",
  "delivered",
"confirmed",
"cancelled",
  "failed",
  "disputed",
  "returned",
] as const;

export type DeliveryStatus =
  (typeof DELIVERY_STATUSES)[number];

const allowedTransitions: Record<
  DeliveryStatus,
  DeliveryStatus[]
> = {
  draft: ["booked", "cancelled"],
  booked: ["matching", "cancelled"],
  matching: ["offered", "cancelled"],
  offered: ["accepted", "cancelled"],
  accepted: ["pickup_pending", "cancelled"],
  pickup_pending: ["picked_up", "cancelled", "failed"],
  picked_up: ["in_transit", "failed"],
  in_transit: ["near_destination", "delivered", "failed", "disputed"],
  near_destination: ["delivered", "failed", "disputed"],
 delivered: ["confirmed", "disputed"],
confirmed: [],  cancelled: [],
  failed: ["returned"],
  disputed: ["returned", "confirmed"],
  returned: [],
};

export function isDeliveryStatus(
  status: string,
): status is DeliveryStatus {
  return DELIVERY_STATUSES.includes(
    status as DeliveryStatus,
  );
}

export function canTransitionDelivery(
  from: string,
  to: string,
): boolean {
  if (!isDeliveryStatus(from) || !isDeliveryStatus(to)) {
    return false;
  }

  return allowedTransitions[from].includes(to);
}
