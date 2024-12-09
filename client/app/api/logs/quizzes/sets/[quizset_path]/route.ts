import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { NextRequest, NextResponse } from "next/server";
type Props = {
  params: {
    quizset_path: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const url = request.url;

    // URL 객체 생성
    const { searchParams } = new URL(url);
    const quizsetPath = props.params.quizset_path;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "User ID is required",
          },
        },
        { status: 400 }
      );
    }

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        // path: quizsetPath,
        paths: {
          has: quizsetPath, // Ensure jobId exists in the jobIds array
        },
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
        // jobId: quizSet.jobId,
        domainId: quizSet.domainId,
      },
    });

    return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
  } catch (error: unknown) {
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
    const body = await request.json();
    const { userId } = body;

    const quizsetPath = props.params.quizset_path;
    console.log("quizSet post", quizsetPath);
    const quizSet = await prisma.quizSet.findFirst({
      where: {
        // path: quizsetPath,
        paths: {
          has: quizsetPath, // Ensure jobId exists in the jobIds array
        },
      },
    });

    console.log("quizSet:", quizsetPath, quizSet);

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

    const { domainCode, jobCode, languageCode } =
      extractCodesFromPath(quizsetPath);
    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    const job = await prisma.job.findFirst({
      where: {
        code: jobCode,
      },
    });

    console.log("language:", language);
    console.log("job:", job);

    const userCampaignDomainLog = await prisma.userCampaignDomainLog.create({
      data: {
        userId: userId,
        campaignId: quizSet.campaignId,
        // firstBadgeStage: quizSet.badgeStages,
        isFirstBadgeStageCompleted: false,
        isCompleted: false,
        isBadgeAcquired: false,
        jobId: job?.id,
        quizSetId: quizSet.id,
        domainId: quizSet.domainId,
        // firstBadgeActivityId: quizSet.firstBadgeActivityId,
        // lastBadgeActivityId: quizSet.lastBadgeActivityId,
        languageId: language?.id,
      },
    });

    return NextResponse.json({ item: userCampaignDomainLog }, { status: 200 });
  } catch (e: unknown) {
    console.error("Error creating user campaign domain log:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
