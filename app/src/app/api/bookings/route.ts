import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerId,
      package: packageInput,
      pickup,
      destination,
      option,
      currency,
      requestedPickupTime,
      deliveryDeadline,
    } = body;

    if (!customerId) {
      return Response.json(
        {
          success: false,
          message: "customerId is required",
        },
        { status: 400 },
      );
    }

    if (!packageInput) {
      return Response.json(
        {
          success: false,
          message: "Package information is required",
        },
        { status: 400 },
      );
    }

    if (!pickup || !destination) {
      return Response.json(
        {
          success: false,
          message: "Pickup and destination are required",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const packageRecord = await tx.package.create({
        data: {
          category: packageInput.category ?? "standard",
          weightKg: Number(packageInput.weightKg),
          lengthCm: Number(packageInput.lengthCm ?? 0),
          widthCm: Number(packageInput.widthCm ?? 0),
          heightCm: Number(packageInput.heightCm ?? 0),
          description: packageInput.description ?? null,
        },
      });

      const delivery = await tx.delivery.create({
        data: {
          customerId,
          packageId: packageRecord.id,

          pickupAddress: pickup.address,
          pickupLatitude: Number(pickup.coordinates.latitude),
          pickupLongitude: Number(pickup.coordinates.longitude),

          destinationAddress: destination.address,
          destinationLatitude: Number(
            destination.coordinates.latitude,
          ),
          destinationLongitude: Number(
            destination.coordinates.longitude,
          ),

          option: option ?? "standard",
          status: "draft",
          paymentStatus: "pending",

          requestedPickupTime: requestedPickupTime
            ? new Date(requestedPickupTime)
            : null,

          deliveryDeadline: deliveryDeadline
            ? new Date(deliveryDeadline)
            : null,

          currency: currency ?? "NGN",
        },
      });

      return {
        packageRecord,
        delivery,
      };
    });

    return Response.json({
      success: true,
      message: "Booking created successfully",
      package: result.packageRecord,
      delivery: result.delivery,
    });
  } catch (error) {
    console.error("Booking creation failed:", error);

    return Response.json(
      {
        success: false,
        message: "Booking creation failed",
      },
      { status: 500 },
    );
  }
}