import { prisma } from "../../../../lib/prisma";
import {
  canTransitionDelivery,
} from "../../../../lib/delivery-status";

const ACTION_TO_STATUS = {
  pickup: "picked_up",
  start: "in_transit",
  near: "near_destination",
  complete: "delivered",
} as const;

type DeliveryAction =
  keyof typeof ACTION_TO_STATUS;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      deliveryId,
      action,
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

    if (
      !action ||
      typeof action !== "string" ||
      !(action in ACTION_TO_STATUS)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "A valid delivery action is required: pickup, start, near, or complete.",
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

    const nextStatus =
      ACTION_TO_STATUS[action as DeliveryAction];

    if (
      !canTransitionDelivery(
        delivery.status,
        nextStatus,
      )
    ) {
      return Response.json(
        {
          success: false,
          message: `Invalid delivery action: ${action}. Cannot transition ${delivery.status} -> ${nextStatus}.`,
          currentStatus: delivery.status,
          requestedAction: action,
          requestedStatus: nextStatus,
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
          status: nextStatus,
        },
      });

    return Response.json({
      success: true,
      message: `Delivery action ${action} completed.`,
      action,
      previousStatus: delivery.status,
      status: updatedDelivery.status,
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error(
      "Execute delivery action failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message:
          "Failed to execute delivery action.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}
