import { prisma } from "../../../../lib/prisma";

function distanceKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
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

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "offered",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        delivery: {
          include: {
            package: true,
          },
        },
        trip: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    const enrichedMatches = matches.map((match) => {
      const tripDistanceKm =
        match.trip &&
        match.trip.originLatitude != null &&
        match.trip.originLongitude != null &&
        match.trip.destinationLatitude != null &&
        match.trip.destinationLongitude != null
          ? distanceKm(
              match.trip.originLatitude,
              match.trip.originLongitude,
              match.trip.destinationLatitude,
              match.trip.destinationLongitude,
            )
          : null;

      return {
        ...match,
        tripDistanceKm,
      };
    });

    return Response.json({
      success: true,
      matches: enrichedMatches,
    });
  } catch (error) {
    console.error(
      "Get offered matches failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Failed to retrieve offered matches.",
      },
      { status: 500 },
    );
  }
}
