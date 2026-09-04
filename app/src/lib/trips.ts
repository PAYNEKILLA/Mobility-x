export type TripStatus =
  | "open"
  | "matched"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Trip = {
  id: string;
  partnerId: string;
  vehicleId: string;

  origin: string;
  destination: string;

  departureTime: string;

  availableWeightKg: number;

  availableVolumeCm3: number;

  status: TripStatus;

  createdAt: string;
};

export function createTrip(
  trip: Omit<Trip, "id" | "createdAt">
): Trip {
  return {
    ...trip,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}