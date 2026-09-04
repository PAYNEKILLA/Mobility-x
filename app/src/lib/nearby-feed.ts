import {
  calculateRecommendation,
  type RecommendationResult,
} from "./recommendations";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type NearbyListing = {
  id: string;
  origin: string;
  destination: string;
  originCoordinates: Coordinates;
  estimatedEarnings: number;
  currency: string;
routeScore: number;
};
export type NearbyFeedItem = NearbyListing & {
  distanceKm: number;
  recommendation: RecommendationResult;
};

function distanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    ((second.latitude - first.latitude) * Math.PI) / 180;

  const longitudeDifference =
    ((second.longitude - first.longitude) * Math.PI) / 180;

  const firstLatitude =
    (first.latitude * Math.PI) / 180;

  const secondLatitude =
    (second.latitude * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function getNearbyFeed(
  userLocation: Coordinates,
  listings: NearbyListing[],
  maximumDistanceKm = 25,
): NearbyFeedItem[] {
  return listings
  .map((listing) => {
    const calculatedDistance = Number(
      distanceKm(
        userLocation,
        listing.originCoordinates,
      ).toFixed(2),
    );

    const recommendation = calculateRecommendation({
      distanceKm: calculatedDistance,
      routeScore: listing.routeScore,
      earnings: listing.estimatedEarnings,
      packageWeightKg: 0,
      carrierCapacityKg: 999,
      timingCompatible: true,
      available: true,
    });

    return {
      ...listing,
      distanceKm: calculatedDistance,
      recommendation,
    };
  })
    .filter(
      (listing) =>
        listing.distanceKm <= maximumDistanceKm,
    )
    .sort(
      (first, second) =>
        first.distanceKm - second.distanceKm,
    );
}