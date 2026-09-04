import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.count();

    const latestDelivery =
      await prisma.delivery.findFirst({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          package: true,
        },
      });

    const latestMatch =
      await prisma.match.findFirst({
        orderBy: {
          id: "desc",
        },
      });

    return Response.json({
      success: true,
      message: "Database connection successful",
      users,
      latestDelivery,
      latestMatch,
    });
  } catch (error) {
    console.error(
      "Database inspection failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Database inspection failed",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 },
    );
  }
}