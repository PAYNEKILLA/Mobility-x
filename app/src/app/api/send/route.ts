import { prisma } from "../../../lib/prisma";

const locations: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "lagos island": {
    latitude: 6.4541,
    longitude: 3.3947,
  },

  "victoria island": {
    latitude: 6.4281,
    longitude: 3.4219,
  },

  makurdi: {
    latitude: 7.7322,
    longitude: 8.5391,
  },

  gbajimba: {
    latitude: 7.8167,
    longitude: 8.6167,
  },

  abuja: {
    latitude: 9.0765,
    longitude: 7.3986,
  },

  kaduna: {
    latitude: 10.5105,
    longitude: 7.4165,
  },
};

function getCoordinates(location: string) {
  const normalized =
    location.trim().toLowerCase();

  return locations[normalized] ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerId,
      pickup,
      destination,
      description,
      packageSize,
      weightKg,
      pickupTime,
    } = body;

    if (
      !customerId ||
      !pickup ||
      !destination ||
      !description ||
      !packageSize ||
      !weightKg ||
      !pickupTime
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Missing required package information.",
        },
        { status: 400 },
      );
    }

    const pickupCoordinates =
      getCoordinates(pickup);

    const destinationCoordinates =
      getCoordinates(destination);

    if (!pickupCoordinates) {
      return Response.json(
        {
          success: false,
          message:
            `We don't have coordinates for pickup location "${pickup}". Please use a supported location.`,
        },
        { status: 400 },
      );
    }

    if (!destinationCoordinates) {
      return Response.json(
        {
          success: false,
          message:
            `We don't have coordinates for destination "${destination}". Please use a supported location.`,
        },
        { status: 400 },
      );
    }

    const weight = Number(weightKg);

    if (
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid package weight.",
        },
        { status: 400 },
      );
    }

    const maxWeight =
      packageSize === "small"
        ? 5
        : packageSize === "medium"
          ? 15
          : packageSize === "large"
            ? 30
            : 0;

    if (!maxWeight) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid package size.",
        },
        { status: 400 },
      );
    }

    if (weight > maxWeight) {
      return Response.json(
        {
          success: false,
          message:
            `This ${packageSize} package can only weigh up to ${maxWeight} kg.`,
        },
        { status: 400 },
      );
    }

    const pickupDate =
      new Date(pickupTime);

    if (
      Number.isNaN(
        pickupDate.getTime(),
      )
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Invalid pickup time.",
        },
        { status: 400 },
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          const packageRecord =
            await tx.package.create({
              data: {
                category: "standard",
                weightKg: weight,
                lengthCm: 0,
                widthCm: 0,
                heightCm: 0,
                description:
                  description.trim(),
              },
            });

          const delivery =
            await tx.delivery.create({
              data: {
                customerId,
                packageId:
                  packageRecord.id,

                pickupAddress:
                  pickup.trim(),

                pickupLatitude:
                  pickupCoordinates.latitude,

                pickupLongitude:
                  pickupCoordinates.longitude,

                destinationAddress:
                  destination.trim(),

                destinationLatitude:
                  destinationCoordinates.latitude,

                destinationLongitude:
                  destinationCoordinates.longitude,

                option: packageSize,

                status: "draft",

                paymentStatus:
                  "pending",

                requestedPickupTime:
                  pickupDate,

                currency: "NGN",
              },
            });

          return {
            packageRecord,
            delivery,
          };
        },
      );

    return Response.json({
      success: true,
      message:
        "Package and delivery created successfully.",
      package:
        result.packageRecord,
      delivery:
        result.delivery,
    });
  } catch (error) {
    console.error(
      "Send package API error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to create package delivery.",
      },
      { status: 500 },
    );
  }
}