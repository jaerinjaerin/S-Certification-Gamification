import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
    campaign_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    // console.log("props:", props.params);
    const userId = props.params.user_id;
    const campaignId = props.params.campaign_id;
    const log = await prisma.userQuizLog.findFirst({
      where: {
        userId,
        campaignId,
      },
      // include: {
      //   quizSet: true,
      // },
    });

    // console.log("log:", log);
    return NextResponse.json({ item: log }, { status: 200 });
    // response.headers.set("Cache-Control", "public, max-age=3600");
    // return response;
  } catch (error) {
    console.error("Error UserCampaignQuizLog Data:", error);
    Sentry.captureException(error);

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
