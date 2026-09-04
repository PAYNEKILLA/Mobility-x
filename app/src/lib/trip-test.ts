import { createTrip } from "./trips";

const trip = createTrip({
  partnerId: "partner-001",
  vehicleId: "vehicle-001",

  origin: "Makurdi",
  destination: "Abuja",

  departureTime: "2026-08-06T08:00:00Z",

  availableWeightKg: 20,

  availableVolumeCm3: 120000,

  status: "open",
});

console.log("Mobility-X Trip Engine Test");
console.log("---------------------------");
console.log("Trip ID:", trip.id);
console.log("Partner:", trip.partnerId);
console.log("Vehicle:", trip.vehicleId);
console.log("Route:", `${trip.origin} → ${trip.destination}`);
console.log("Departure:", trip.departureTime);
console.log("Available weight:", `${trip.availableWeightKg} kg`);
console.log("Available volume:", `${trip.availableVolumeCm3} cm³`);
console.log("Status:", trip.status);
console.log("Created:", trip.createdAt);