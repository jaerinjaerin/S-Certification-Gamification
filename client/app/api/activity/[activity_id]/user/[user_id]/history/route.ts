import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: { activity_id: string; user_id: string };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const activityId = props.params.activity_id;

    const userCampaignActivityLog =
      await prisma.userCampaignActivityLog.findFirst({
        where: {
          activityId: activityId,
        },
      });

    return NextResponse.json(
      { item: userCampaignActivityLog },
      { status: 200 }
    );
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

export async function POST(request: NextRequest, props: Props) {
  try {
    const activityId = props.params.activity_id;
    const userId = props.params.user_id;

    const body = await request.json();

    const campaignActivity = await prisma.campaignActivity.findFirst({
      where: {
        activityId: activityId,
      },
    });

    if (!campaignActivity) {
      return NextResponse.json(
        {
          status: 404,
          message: "Campaign activity not found",
          error: {
            code: "NOT_FOUND",
            details:
              "The quiz isn't ready just yet. Please hold on for a moment. Thank you for your patience!",
          },
        },
        { status: 404 }
      );
    }

    const item = await prisma.userCampaignActivityLog.create({
      data: {
        activityId: activityId,
        userId: userId,
        completed: false,
        campaignId: campaignActivity.campaignId,
        campaignActivityId: campaignActivity.id,
        countryCode: campaignActivity.countryCode,
        ...body,
      },
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
