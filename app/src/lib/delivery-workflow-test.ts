
import { createDelivery } from "./deliveries";

import {
  pickupDelivery,
  startTransit,
  completeDelivery,
  cancelDelivery,
} from "./delivery-workflow";

const delivery = createDelivery({
  customerId: "customer-001",
  packageId: "package-001",

  pickup: {
    address: "Makurdi, Benue State",
    coordinates: {
      latitude: 7.7322,
      longitude: 8.5391,
    },
  },

  destination: {
    address: "Abuja, FCT",
    coordinates: {
      latitude: 9.0765,
      longitude: 7.3986,
    },
  },

  option: "standard",
  status: "pickup_pending",
  paymentStatus: "pending",
  currency: "NGN",
});

console.log("Mobility-X Delivery Workflow Test");
console.log("---------------------------------");

console.log("Initial:", delivery.status);

const pickedUp = pickupDelivery(delivery);
console.log("Picked Up:", pickedUp.status);

const inTransit = startTransit(pickedUp);
console.log("In Transit:", inTransit.status);

const delivered = completeDelivery(inTransit);
console.log("Delivered:", delivered.status);

const cancelled = cancelDelivery(delivery);
console.log("Cancelled:", cancelled.status);