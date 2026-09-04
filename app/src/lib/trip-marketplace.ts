export type TripCarrierType = "driver" | "traveler";

export type TripAvailability =
  | "available"
  | "full"
  | "cancelled"
  | "completed";

export interface TripMarketplaceListing {
  id: string;

  carrierId: string;
  carrierType: TripCarrierType;

  origin: string;
  destination: string;

  departureTime: string;

  availableWeightKg: number;
  availablePackageCount: number;

  estimatedEarnings: number;
  currency: string;

  availability: TripAvailability;
}

export interface CreateTripMarketplaceListingInput {
  carrierId: string;
  carrierType: TripCarrierType;

  origin: string;
  destination: string;

  departureTime: string;

  availableWeightKg: number;
  availablePackageCount: number;

  estimatedEarnings: number;
  currency: string;

  availability: TripAvailability;
}

export function createTripMarketplaceListing(
  input: CreateTripMarketplaceListingInput,
): TripMarketplaceListing {
  return {
    id: crypto.randomUUID(),
    ...input,
  };
}