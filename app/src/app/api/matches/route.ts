import { prisma } from "../../../lib/prisma";
import { calculateMatch } from "../../../lib/matching";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      deliveryId,
      tripId,
    } = body;

    if (!deliveryId || !tripId) {
      return Response.json(
        {
          success: false,
          message: "deliveryId and tripId are required.",
        },
        { status: 400 },
      );
    }

    const deliveryRecord =
      await prisma.delivery.findUnique({
        where: {
          id: deliveryId,
        },
        include: {
          package: true,
        },
      });

    if (!deliveryRecord) {
      return Response.json(
        {
          success: false,
          message: "Delivery not found.",
        },
        { status: 404 },
      );
    }

    const tripRecord =
      await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          vehicle: true,
        },
      });

    if (!tripRecord) {
      return Response.json(
        {
          success: false,
          message: "Selected trip not found.",
        },
        { status: 404 },
      );
    }

    if (tripRecord.status !== "published") {
      return Response.json(
        {
          success: false,
          message: "This trip is no longer available.",
        },
        { status: 409 },
      );
    }

    const trip = {
      id: tripRecord.id,

      partnerId:
        tripRecord.partnerId,

      vehicleId:
        tripRecord.vehicleId,

      origin: {
        address:
          tripRecord.originAddress,

        coordinates: {
          latitude:
            tripRecord.originLatitude,

          longitude:
            tripRecord.originLongitude,
        },
      },

      destination: {
        address:
          tripRecord.destinationAddress,

        coordinates: {
          latitude:
            tripRecord.destinationLatitude,

          longitude:
            tripRecord.destinationLongitude,
        },
      },

      departureTime:
        tripRecord.departureTime.toISOString(),

      estimatedArrivalTime:
        tripRecord.estimatedArrivalTime
          ? tripRecord.estimatedArrivalTime.toISOString()
          : undefined,

      availablePackageCount:
        tripRecord.availablePackageCount,

      availableWeightKg:
        tripRecord.availableWeightKg,

      acceptedCategories:
        tripRecord.acceptedCategories
          .split(",")
          .map(
            (category) =>
              category.trim() as
                | "standard"
                | "fragile"
                | "high_value"
                | "temperature_sensitive"
                | "restricted",
          )
          .filter(Boolean),

      status: "published" as const,
    };

    const vehicle = {
      id:
        tripRecord.vehicle.id,

      ownerId:
        tripRecord.vehicle.ownerId,

      type:
        tripRecord.vehicle.type as
          | "motorcycle"
          | "car"
          | "van"
          | "truck",

      make:
        tripRecord.vehicle.make ??
        undefined,

      model:
        tripRecord.vehicle.model ??
        undefined,

      registrationNumber:
        tripRecord.vehicle.registrationNumber ??
        undefined,

      maxWeightKg:
        tripRecord.vehicle.maxWeightKg,

      maxPackageCount:
        tripRecord.vehicle.maxPackageCount,

      verificationStatus:
        tripRecord.vehicle.verificationStatus as
          | "pending"
          | "verified"
          | "rejected"
          | "expired",
    };

    const delivery = {
      id:
        deliveryRecord.id,

      customerId:
        deliveryRecord.customerId,

      packageId:
        deliveryRecord.packageId,

      pickup: {
        address:
          deliveryRecord.pickupAddress,

        coordinates: {
          latitude:
            deliveryRecord.pickupLatitude,

          longitude:
            deliveryRecord.pickupLongitude,
        },
      },

      destination: {
        address:
          deliveryRecord.destinationAddress,

        coordinates: {
          latitude:
            deliveryRecord.destinationLatitude,

          longitude:
            deliveryRecord.destinationLongitude,
        },
      },

      option:
        deliveryRecord.option as
          | "express"
          | "standard"
          | "route_to_earn"
          | "scheduled"
          | "dedicated",

      status:
        deliveryRecord.status as
          | "draft"
          | "payment_pending"
          | "matching"
          | "offered"
          | "accepted"
          | "pickup_pending"
          | "picked_up"
          | "in_transit"
          | "arriving"
          | "delivered"
          | "confirmed"
          | "cancelled"
          | "failed"
          | "disputed"
          | "return_required"
          | "returned",

      paymentStatus:
        deliveryRecord.paymentStatus as
          | "pending"
          | "authorized"
          | "held"
          | "release_pending"
          | "released"
          | "refunded"
          | "disputed"
          | "failed",

      requestedPickupTime:
        deliveryRecord.requestedPickupTime
          ? deliveryRecord.requestedPickupTime.toISOString()
          : undefined,

      deliveryDeadline:
        deliveryRecord.deliveryDeadline
          ? deliveryRecord.deliveryDeadline.toISOString()
          : undefined,

      estimatedPrice:
        deliveryRecord.estimatedPrice ??
        undefined,

      currency:
        deliveryRecord.currency,

      createdAt:
        deliveryRecord.createdAt.toISOString(),
    };

    const packageData = {
      id:
        deliveryRecord.package.id,

      category:
        deliveryRecord.package.category as
          | "standard"
          | "fragile"
          | "high_value"
          | "temperature_sensitive"
          | "restricted",

      weightKg:
        deliveryRecord.package.weightKg,

      lengthCm:
        deliveryRecord.package.lengthCm,

      widthCm:
        deliveryRecord.package.widthCm,

      heightCm:
        deliveryRecord.package.heightCm,

      description:
        deliveryRecord.package.description ??
        undefined,
    };

    const result = calculateMatch({
      trip,
      delivery,
      package: packageData,
      vehicle,
    });

    if (!result.eligible) {
      return Response.json(
        {
          success: false,
          message:
            "This carrier no longer meets the delivery requirements.",
          match: result,
        },
        { status: 409 },
      );
    }

    const existingMatch =
      await prisma.match.findFirst({
        where: {
          deliveryId,
          tripId,
        },
      });

    if (existingMatch) {
      return Response.json({
        success: true,
        message: "Carrier match already exists.",
        match: existingMatch,
      });
    }

    const match =
      await prisma.match.create({
        data: {
          deliveryId,
          tripId,
          partnerId:
            tripRecord.partnerId,

          compatibilityScore:
            result.compatibilityScore,

          routeCompatibility:
            result.routeCompatibility,

          timeCompatibility:
            result.timeCompatibility,

          detourDistanceKm:
            result.detourDistanceKm,

          estimatedExtraMinutes:
            result.estimatedExtraMinutes,

          status: "offered",
        },
      });

    await prisma.delivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        status: "offered",
      },
    });

    return Response.json({
      success: true,
      message:
        "Carrier selected successfully.",
      match,
    });
  } catch (error) {
    console.error(
      "Create carrier match failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to select carrier.",
      },
      { status: 500 },
    );
  }
}