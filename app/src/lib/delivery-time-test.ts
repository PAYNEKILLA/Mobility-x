import {
  isDeliveryTimingCompatible,
} from "./delivery-time";

const pickupTime = "2026-08-12T17:00:00.000Z";

const arrivalTime = "2026-08-13T12:00:00.000Z";

const compatiblePreferences = {
  pickupWindow: {
    start: "2026-08-12T16:00:00.000Z",
    end: "2026-08-12T18:00:00.000Z",
  },
  deliveryDeadline: "2026-08-13T14:00:00.000Z",
};

const incompatiblePreferences = {
  pickupWindow: {
    start: "2026-08-12T18:00:00.000Z",
    end: "2026-08-12T20:00:00.000Z",
  },
  deliveryDeadline: "2026-08-13T14:00:00.000Z",
};

console.log("Mobility-X Delivery Time Test");
console.log("==============================");

console.log("");
console.log("Compatible delivery:");
console.log(
  isDeliveryTimingCompatible(
    pickupTime,
    arrivalTime,
    compatiblePreferences,
  )
    ? "Compatible"
    : "Not compatible",
);

console.log("");
console.log("Incompatible pickup window:");
console.log(
  isDeliveryTimingCompatible(
    pickupTime,
    arrivalTime,
    incompatiblePreferences,
  )
    ? "Compatible"
    : "Not compatible",
);