import type { Delivery } from "./domain";

export function pickupDelivery(delivery: Delivery): Delivery {
  return {
    ...delivery,
    status: "picked_up",
  };
}

export function startTransit(delivery: Delivery): Delivery {
  return {
    ...delivery,
    status: "in_transit",
  };
}

export function completeDelivery(delivery: Delivery): Delivery {
  return {
    ...delivery,
    status: "delivered",
  }; 
}

export function cancelDelivery(delivery: Delivery): Delivery {
  return {
    ...delivery,
    status: "cancelled",
  };
}