import { prisma } from "../../../../lib/prisma";
import {
  canTransitionDelivery,
  isDeliveryStatus,
} from "../../../../lib/delivery-status";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      deliveryId,
      status,
    } = body;

    if (!deliveryId) {
      return Response.json(
        {
          success: false,
          message: "deliveryId is required.",
        },
        { status: 400 },
      );
    }

    if (!status || typeof status !== "string") {
      return Response.json(
        {
          success: false,
          message: "A valid delivery status is required.",
        },
        { status: 400 },
      );
    }

    if (!isDeliveryStatus(status)) {
      return Response.json(
        {
          success: false,
          message: `Invalid delivery status: ${status}.`,
        },
        { status: 400 },
      );
    }

    const delivery =
      await prisma.delivery.findUnique({
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

    if (
      !canTransitionDelivery(
        delivery.status,
        status,
      )
    ) {
      return Response.json(
        {
          success: false,
          message: `Invalid delivery transition: ${delivery.status} -> ${status}.`,
          currentStatus: delivery.status,
          requestedStatus: status,
        },
        { status: 409 },
      );
    }

    const updatedDelivery =
      await prisma.delivery.update({
        where: {
          id: deliveryId,
        },
        data: {
          status,
        },
      });

    return Response.json({
      success: true,
      message: `Delivery status updated to ${status}.`,
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error(
      "Update delivery status failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to update delivery status.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}


