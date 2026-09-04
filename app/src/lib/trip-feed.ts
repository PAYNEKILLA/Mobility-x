import type { TripMarketplaceListing } from "./trip-marketplace";

export type TripFeedMatchReason =
  | "same_route"
  | "nearby_origin"
  | "nearby_destination"
  | "good_earning";

export type TripFeedItem = TripMarketplaceListing & {
  matchScore: number;
  matchReason: TripFeedMatchReason;
};

export type TripFeedRequest = {
  currentLocation: string;
  destination: string;
};

export function getTripFeed(
  request: TripFeedRequest,
  listings: TripMarketplaceListing[],
): TripFeedItem[] {
  const destination = request.destination.toLowerCase();
  const currentLocation = request.currentLocation.toLowerCase();

  return listings
    .filter((listing) => listing.availability === "available")
    .map((listing) => {
      const origin = listing.origin.toLowerCase();
      const listingDestination =
        listing.destination.toLowerCase();

      let routeScore = 0;
      let matchReason: TripFeedMatchReason = "good_earning";

      if (
        origin === currentLocation &&
        listingDestination === destination
      ) {
        routeScore = 80;
        matchReason = "same_route";
      } else if (origin === currentLocation) {
        routeScore = 60;
        matchReason = "nearby_origin";
      } else if (listingDestination === destination) {
        routeScore = 50;
        matchReason = "nearby_destination";
      }

      // Earnings contribute up to 20 points.
      const earningsScore = Math.min(
        listing.estimatedEarnings / 100,
        20,
      );

      const matchScore = Math.min(
        100,
        Math.round(
          (routeScore + earningsScore) * 100,
        ) / 100,
      );

      return {
        ...listing,
        matchScore,
        matchReason,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}