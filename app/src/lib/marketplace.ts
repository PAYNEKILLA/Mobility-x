export type CarrierType =
  | "professional_driver"
  | "commercial_driver"
  | "traveler"
  | "motorcycle_rider";

export type TripAvailability =
  | "available"
  | "full"
  | "started"
  | "completed"
  | "cancelled";

export type TripMarketplaceListing = {
  id: string;

  carrierId: string;
  carrierType: CarrierType;

  origin: string;
  destination: string;

  departureTime: string;

  availableWeightKg: number;
  availablePackageCount: number;

  estimatedEarnings: number;
  currency: string;

  availability: TripAvailability;

  createdAt: string;
};

export function createTripMarketplaceListing(
  listing: Omit<TripMarketplaceListing, "id" | "createdAt">
): TripMarketplaceListing {
  return {
    ...listing,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}