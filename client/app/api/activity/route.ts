import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const activityId = searchParams.get("activity_id");

  if (!activityId) {
    return NextResponse.json(
      {
        status: 400,
        message: "Missing required parameters",
        error: {
          code: "BAD_REQUEST",
          details: "activityId is required",
        },
      },
      { status: 400 }
    );
  }

  try {
    const campaignActivity = await prisma.campaignActivity.findFirst({
      where: {
        id: activityId,
      },
      include: {
        country: true,
        campaign: true,
      },
    });

    return NextResponse.json({ item: campaignActivity }, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
