import type {
  Delivery,
  Package,
  Trip,
  Vehicle,
} from "./domain";

export interface MatchingInput {
  trip: Trip;
  delivery: Delivery;
  package: Package;
  vehicle: Vehicle;
}

export interface MatchingResult {
  eligible: boolean;
  compatibilityScore: number;
  routeCompatibility: number;
  timeCompatibility: number;
  detourDistanceKm: number;
  estimatedExtraMinutes: number;
  explanation: {
    route: "high" | "medium" | "low";
    time: "high" | "medium" | "low";
    detour: "high" | "medium" | "low";
    capacity: "available" | "insufficient";
    vehicle: "compatible" | "incompatible";
  };
}

function distanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos((latitude1 * Math.PI) / 180) *
      Math.cos((latitude2 * Math.PI) / 180) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function scoreLevel(
  score: number,
): "high" | "medium" | "low" {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function calculateTimeCompatibility(
  requestedPickupTime: string | undefined,
  tripDepartureTime: string,
): number {
  if (!requestedPickupTime) {
    return 100;
  }

  const requestedTime = new Date(
    requestedPickupTime,
  ).getTime();

  const departureTime = new Date(
    tripDepartureTime,
  ).getTime();

  if (
    Number.isNaN(requestedTime) ||
    Number.isNaN(departureTime)
  ) {
    return 50;
  }

  const differenceMinutes =
    Math.abs(requestedTime - departureTime) /
    (1000 * 60);

  if (differenceMinutes <= 30) {
    return 100;
  }

  if (differenceMinutes <= 60) {
    return 90;
  }

  if (differenceMinutes <= 120) {
    return 75;
  }

  if (differenceMinutes <= 240) {
    return 55;
  }

  if (differenceMinutes <= 360) {
    return 35;
  }

  return 15;
}

export function calculateMatch(
  input: MatchingInput,
): MatchingResult {
  const {
    trip,
    delivery,
    package: packageData,
    vehicle,
  } = input;

  const pickupDistance = distanceKm(
    trip.origin.coordinates.latitude,
    trip.origin.coordinates.longitude,
    delivery.pickup.coordinates.latitude,
    delivery.pickup.coordinates.longitude,
  );

  const destinationDistance = distanceKm(
    trip.destination.coordinates.latitude,
    trip.destination.coordinates.longitude,
    delivery.destination.coordinates.latitude,
    delivery.destination.coordinates.longitude,
  );

  const baseTripDistance = distanceKm(
    trip.origin.coordinates.latitude,
    trip.origin.coordinates.longitude,
    trip.destination.coordinates.latitude,
    trip.destination.coordinates.longitude,
  );

  const deliveryDistance =
    pickupDistance +
    distanceKm(
      delivery.pickup.coordinates.latitude,
      delivery.pickup.coordinates.longitude,
      delivery.destination.coordinates.latitude,
      delivery.destination.coordinates.longitude,
    ) +
    destinationDistance;

  const detourDistanceKm = Math.max(
    0,
    deliveryDistance - baseTripDistance,
  );

  const estimatedExtraMinutes = Math.round(
    (detourDistanceKm / 50) * 60,
  );

  const routeCompatibility =
    pickupDistance <= 10 &&
    destinationDistance <= 10
      ? 100
      : pickupDistance <= 25 &&
          destinationDistance <= 25
        ? 70
        : 30;

  const timeCompatibility =
    calculateTimeCompatibility(
      delivery.requestedPickupTime,
      trip.departureTime,
    );

  const weightCompatible =
    packageData.weightKg <= trip.availableWeightKg &&
    packageData.weightKg <= vehicle.maxWeightKg;

  const countCompatible =
    trip.availablePackageCount > 0;

  const categoryCompatible =
    trip.acceptedCategories.includes(
      packageData.category,
    );

  const vehicleCompatible =
    weightCompatible &&
    countCompatible &&
    categoryCompatible;

  const detourScore =
    detourDistanceKm <= 2
      ? 100
      : detourDistanceKm <= 5
        ? 80
        : detourDistanceKm <= 10
          ? 60
          : 30;

  const compatibilityScore = Math.round(
    routeCompatibility * 0.4 +
      timeCompatibility * 0.2 +
      detourScore * 0.2 +
      (vehicleCompatible ? 100 : 0) * 0.2,
  );

  const eligible =
    routeCompatibility >= 50 &&
    vehicleCompatible &&
    compatibilityScore >= 50;

  return {
    eligible,
    compatibilityScore,
    routeCompatibility,
    timeCompatibility,
    detourDistanceKm: Number(
      detourDistanceKm.toFixed(2),
    ),
    estimatedExtraMinutes,
    explanation: {
      route: scoreLevel(routeCompatibility),
      time: scoreLevel(timeCompatibility),
      detour: scoreLevel(detourScore),
      capacity:
        weightCompatible && countCompatible
          ? "available"
          : "insufficient",
      vehicle: vehicleCompatible
        ? "compatible"
        : "incompatible",
    },
  };
}