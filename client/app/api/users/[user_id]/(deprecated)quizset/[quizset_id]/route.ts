import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    quizset_id: string;
    user_id: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const userId = props.params.user_id;
    const quizsetId = props.params.quizset_id;

    const quizSet = await prisma.campaignDomainQuizSet.findFirst({
      where: {
        id: quizsetId,
      },
    });

    if (!quizSet) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz set not found",
          },
        },
        { status: 404 }
      );
    }

    const userCampaignDomainLog = await prisma.userCampaignDomainLog.findFirst({
      where: {
        userId: userId,
        campaignId: quizSet.campaignId,
        jobId: quizSet.jobId,
        domainId: quizSet.domainId,
      },
    });

    return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
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
    const userId = props.params.user_id;
    const quizsetId = props.params.quizset_id;
    console.log("quizSet:", quizsetId, userId);
    const quizSet = await prisma.campaignDomainQuizSet.findFirst({
      where: {
        id: quizsetId,
      },
    });

    console.log("quizSet:", quizsetId, quizSet);

    if (!quizSet) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz set not found",
          },
        },
        { status: 404 }
      );
    }

    const userCampaignDomainLog = await prisma.userCampaignDomainLog.create({
      data: {
        userId: userId,
        campaignId: quizSet.campaignId,
        firstBadgeStage: quizSet.firstBadgeStage,
        isFirstBadgeStageCompleted: false,
        isCompleted: false,
        isBadgeAcquired: false,
        jobId: quizSet.jobId,
        campaignDomainQuizSetId: quizSet.id,
        domainId: quizSet.domainId,
        firstBadgeActivityId: quizSet.firstBadgeActivityId,
        lastBadgeActivityId: quizSet.lastBadgeActivityId,
        languageId: quizSet.languageId,
      },
    });

    return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
  } catch (e: any) {
    console.error("Error creating user campaign domain log:", e);
    return NextResponse.json({ error: e.error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
