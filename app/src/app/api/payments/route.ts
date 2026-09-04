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

    const payment =
      await prisma.payment.findFirst({
        where: {
          deliveryId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!payment) {
      return Response.json(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "Get payment failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Failed to retrieve payment.",
      },
      { status: 500 },
    );
  }
}

const allowedActions = [
  "create",
  "authorize",
  "hold",
  "complete",
  "release",
] as const;

type PaymentAction = (typeof allowedActions)[number];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      action,
      paymentId,
      deliveryId,
      amount,
      currency,
    } = body as {
      action?: PaymentAction;
      paymentId?: string;
      deliveryId?: string;
      amount?: number;
      currency?: string;
    };

    if (!action || !allowedActions.includes(action)) {
      return Response.json(
        {
          success: false,
          message:
            "A valid payment action is required.",
        },
        { status: 400 },
      );
    }

    if (action === "create") {
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
        !Number.isFinite(amount) ||
        Number(amount) <= 0
      ) {
        return Response.json(
          {
            success: false,
            message: "A valid payment amount is required.",
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

      const existingPayment =
        await prisma.payment.findFirst({
          where: {
            deliveryId,
            status: {
              not: "refunded",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (existingPayment) {
        return Response.json({
          success: true,
          message: "Payment already exists.",
          payment: existingPayment,
        });
      }

      const payment =
        await prisma.payment.create({
          data: {
            deliveryId,
            customerId: delivery.customerId,
            amount: Number(amount),
            currency: currency ?? delivery.currency,
            status: "pending",
          },
        });

      await prisma.delivery.update({
        where: {
          id: deliveryId,
        },
        data: {
          paymentStatus: "pending",
        },
      });

      return Response.json({
        success: true,
        message: "Payment created successfully.",
        payment,
      });
    }

    if (!paymentId) {
      return Response.json(
        {
          success: false,
          message: "paymentId is required.",
        },
        { status: 400 },
      );
    }

    const payment =
      await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

    if (!payment) {
      return Response.json(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 },
      );
    }

    if (action === "authorize") {
      if (payment.status !== "pending") {
        return Response.json(
          {
            success: false,
            message:
              `Payment cannot be authorized from status: ${payment.status}`,
          },
          { status: 409 },
        );
      }

      const updatedPayment =
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "authorized",
          },
        });

      await prisma.delivery.update({
        where: {
          id: payment.deliveryId,
        },
        data: {
          paymentStatus: "authorized",
        },
      });

      return Response.json({
        success: true,
        message: "Payment authorized successfully.",
        payment: updatedPayment,
      });
    }

    if (action === "hold") {
      if (payment.status !== "authorized") {
        return Response.json(
          {
            success: false,
            message:
              `Payment cannot be held from status: ${payment.status}`,
          },
          { status: 409 },
        );
      }

      const updatedPayment =
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "held",
            heldAt: new Date(),
          },
        });

      await prisma.delivery.update({
        where: {
          id: payment.deliveryId,
        },
        data: {
          paymentStatus: "held",
        },
      });

      return Response.json({
        success: true,
        message: "Payment secured successfully.",
        payment: updatedPayment,
      });
    }

    if (action === "complete") {
      if (payment.status !== "held") {
        return Response.json(
          {
            success: false,
            message:
              `Delivery cannot be completed while payment is ${payment.status}.`,
          },
          { status: 409 },
        );
      }

      const result =
        await prisma.$transaction(async (tx) => {
          const updatedPayment =
            await tx.payment.update({
              where: {
                id: paymentId,
              },
              data: {
                status: "release_pending",
              },
            });

          const updatedDelivery =
            await tx.delivery.update({
              where: {
                id: payment.deliveryId,
              },
              data: {
                status: "delivered",
                paymentStatus: "release_pending",
              },
            });

          return {
            payment: updatedPayment,
            delivery: updatedDelivery,
          };
        });

      return Response.json({
        success: true,
        message:
          "Delivery completed and payment is pending release.",
        ...result,
      });
    }

    if (action === "release") {
      if (payment.status !== "release_pending") {
        return Response.json(
          {
            success: false,
            message:
              `Payment cannot be released from status: ${payment.status}`,
          },
          { status: 409 },
        );
      }

      const result =
        await prisma.$transaction(async (tx) => {
          const updatedPayment =
            await tx.payment.update({
              where: {
                id: paymentId,
              },
              data: {
                status: "released",
                releasedAt: new Date(),
              },
            });

          const updatedDelivery =
            await tx.delivery.update({
              where: {
                id: payment.deliveryId,
              },
              data: {
                status: "confirmed",
                paymentStatus: "released",
              },
            });

          return {
            payment: updatedPayment,
            delivery: updatedDelivery,
          };
        });

      return Response.json({
        success: true,
        message:
          "Payment released successfully.",
        ...result,
      });
    }

    return Response.json(
      {
        success: false,
        message: "Unsupported payment action.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error(
      "Payment API error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Payment operation failed.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}