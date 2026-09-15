import { prisma } from "../../../../lib/prisma";
import { canTransitionDelivery } from "../../../../lib/delivery-status";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { deliveryId, customerId } = body;

    if (!deliveryId || !customerId) {
      return Response.json(
        {
          success: false,
          message: "deliveryId and customerId are required.",
        },
        { status: 400 },
      );
    }

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: deliveryId,
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

    if (delivery.customerId !== customerId) {
      return Response.json(
        {
          success: false,
          message: "You are not authorized to confirm this delivery.",
        },
        { status: 403 },
      );
    }

    if (delivery.status !== "delivered") {
      return Response.json(
        {
          success: false,
          message:
            `Delivery cannot be confirmed from status "${delivery.status}".`,
        },
        { status: 409 },
      );
    }

    if (!canTransitionDelivery(delivery.status, "confirmed")) {
      return Response.json(
        {
          success: false,
          message: "Delivery cannot transition to confirmed.",
        },
        { status: 409 },
      );
    }

    const existingConfirmation =
      await prisma.deliveryConfirmation.findUnique({
        where: {
          deliveryId,
        },
      });

    if (existingConfirmation) {
      return Response.json(
        {
          success: false,
          message: "Delivery has already been confirmed.",
          confirmation: existingConfirmation,
        },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const confirmation =
        await tx.deliveryConfirmation.create({
          data: {
            deliveryId,
            customerId,
          },
        });

      const updatedDelivery =
        await tx.delivery.update({
          where: {
            id: deliveryId,
          },
          data: {
            status: "confirmed",
          },
        });

      return {
        confirmation,
        delivery: updatedDelivery,
      };
    });

    return Response.json({
      success: true,
      message: "Delivery confirmed successfully.",
      confirmation: result.confirmation,
      delivery: result.delivery,
    });
  } catch (error) {
    console.error(
      "Confirm delivery API error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Failed to confirm delivery.",
      },
      { status: 500 },
    );
  }
}