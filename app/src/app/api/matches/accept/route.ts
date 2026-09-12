import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { matchId } = body;

    if (!matchId) {
      return Response.json(
        {
          success: false,
          message: "matchId is required.",
        },
        { status: 400 },
      );
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!match) {
      return Response.json(
        {
          success: false,
          message: "Match not found.",
        },
        { status: 404 },
      );
    }

    if (match.status !== "offered") {
      return Response.json(
        {
          success: false,
          message: "This match is no longer available for acceptance.",
        },
        { status: 409 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const acceptedMatch = await tx.match.update({
        where: {
          id: matchId,
        },
        data: {
          status: "accepted",
        },
      });

      const delivery = await tx.delivery.update({
        where: {
          id: match.deliveryId,
        },
        data: {
          status: "accepted",
        },
      });

      return {
        acceptedMatch,
        delivery,
      };
    });

    return Response.json({
      success: true,
      message: "Carrier accepted successfully.",
      match: result.acceptedMatch,
      delivery: result.delivery,
    });
  } catch (error) {
    console.error(
      "Accept carrier match failed:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Failed to accept carrier match.",
      },
      { status: 500 },
    );
  }
}
