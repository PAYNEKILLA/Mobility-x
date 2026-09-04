import type { Delivery } from "./domain";

export function createDelivery(
  delivery: Omit<Delivery, "id" | "createdAt">,
): Delivery {
  return {
    ...delivery,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}