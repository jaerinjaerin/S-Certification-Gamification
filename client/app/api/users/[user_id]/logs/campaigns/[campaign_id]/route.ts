import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

type Props = {
  params: {
    user_id: string;
    campaign_id: string;
  };
};

export async function GET(request: Request, props: Props) {
  try {
    const userId = props.params.user_id;
    const campaignId = props.params.campaign_id;
    const log = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: campaignId,
      },
      include: {
        quizSet: true,
      },
    });

    console.log("log:", log);
    const response = NextResponse.json({ item: log }, { status: 200 });
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  } catch (error) {
    console.error("Error UserCampaignQuizLog Data:", error);

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
