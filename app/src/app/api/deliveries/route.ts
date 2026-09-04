import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const deliveryId =
      searchParams.get("deliveryId");

    if (!deliveryId) {
      return Response.json(
        {
          success: false,
          message: "deliveryId is required.",
        },
        { status: 400 },
      );
    }

    const delivery =
      await prisma.delivery.findUnique({
        where: {
          id: deliveryId,
        },
        include: {
          package: true,
        },
      });

    if (!delivery) {
      return Response.json(
        {
          success: false,
          message: "Delivery not found.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      delivery: {
        id: delivery.id,

        customerId:
          delivery.customerId,

        packageId:
          delivery.packageId,

        pickup: {
          address:
            delivery.pickupAddress,

          coordinates: {
            latitude:
              delivery.pickupLatitude,

            longitude:
              delivery.pickupLongitude,
          },
        },

        destination: {
          address:
            delivery.destinationAddress,

          coordinates: {
            latitude:
              delivery.destinationLatitude,

            longitude:
              delivery.destinationLongitude,
          },
        },

        option:
          delivery.option,

        status:
          delivery.status,

        paymentStatus:
          delivery.paymentStatus,

        requestedPickupTime:
          delivery.requestedPickupTime
            ? delivery.requestedPickupTime.toISOString()
            : undefined,

        deliveryDeadline:
          delivery.deliveryDeadline
            ? delivery.deliveryDeadline.toISOString()
            : undefined,

        estimatedPrice:
          delivery.estimatedPrice ??
          undefined,

        currency:
          delivery.currency,

        createdAt:
          delivery.createdAt.toISOString(),
      },

      package: {
        id:
          delivery.package.id,

        category:
          delivery.package.category,

        weightKg:
          delivery.package.weightKg,

        lengthCm:
          delivery.package.lengthCm,

        widthCm:
          delivery.package.widthCm,

        heightCm:
          delivery.package.heightCm,

        description:
          delivery.package.description ??
          undefined,
      },
    });
  } catch (error) {
    console.error(
      "Get delivery failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to retrieve delivery.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      phone,
      pickup,
      destination,
      description,
      packageSize,
      weightKg,
      pickupTime,
    } = body;

    // Basic validation
    if (!pickup?.trim()) {
      return Response.json(
        {
          success: false,
          message:
            "Pickup location is required.",
        },
        { status: 400 },
      );
    }

    if (!destination?.trim()) {
      return Response.json(
        {
          success: false,
          message:
            "Destination is required.",
        },
        { status: 400 },
      );
    }

    if (!description?.trim()) {
      return Response.json(
        {
          success: false,
          message:
            "Package description is required.",
        },
        { status: 400 },
      );
    }

    const weight = Number(weightKg);

    if (!weight || weight <= 0) {
      return Response.json(
        {
          success: false,
          message:
            "A valid package weight is required.",
        },
        { status: 400 },
      );
    }

    // Create or reuse a customer.
    const customer =
      email?.trim()
        ? await prisma.user.upsert({
            where: {
              email: email.trim(),
            },
            update: {
              name:
                name?.trim() ||
                "Mobility-X Customer",

              phone:
                phone?.trim() ||
                undefined,
            },
            create: {
              name:
                name?.trim() ||
                "Mobility-X Customer",

              email: email.trim(),

              phone:
                phone?.trim() ||
                undefined,

              role: "customer",
            },
          })
        : await prisma.user.create({
            data: {
              name:
                name?.trim() ||
                "Mobility-X Customer",

              phone:
                phone?.trim() ||
                undefined,

              role: "customer",
            },
          });

    // Create the package.
    const packageRecord =
      await prisma.package.create({
        data: {
          category:
            packageSize || "medium",

          weightKg: weight,

          lengthCm: 30,

          widthCm: 20,

          heightCm: 20,

          description:
            description.trim(),
        },
      });

    // Create the delivery.
    const delivery =
      await prisma.delivery.create({
        data: {
          customerId:
            customer.id,

          packageId:
            packageRecord.id,

          pickupAddress:
            pickup.trim(),

          pickupLatitude: 0,

          pickupLongitude: 0,

          destinationAddress:
            destination.trim(),

          destinationLatitude: 0,

          destinationLongitude: 0,

          option: "standard",

          status: "draft",

          paymentStatus: "pending",

          requestedPickupTime:
            pickupTime
              ? new Date(pickupTime)
              : undefined,

          currency: "NGN",
        },

        include: {
          customer: true,
          package: true,
        },
      });

    return Response.json(
      {
        success: true,

        message:
          "Delivery created successfully.",

        delivery,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Create delivery failed:",
      error,
    );

    return Response.json(
      {
        success: false,

        message:
          "Failed to create delivery.",

        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}