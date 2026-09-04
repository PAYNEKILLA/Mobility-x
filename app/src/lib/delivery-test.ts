import { createDelivery } from "./deliveries";

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

console.log("Mobility-X Delivery Test");
console.log("------------------------");
console.log(delivery);