import { sumtotalUserOthersJobId } from "@/app/core/config/default";
import { ApiError } from "@/app/core/error/api_error";
import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { AuthType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = request.url;
    const { searchParams } = new URL(url);
    const userId = searchParams.get("user_id");
    const campaignName = searchParams.get("campaign_name");

    if (!userId || !campaignName) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "User ID and Campaign Name are required"
      );
    }

    const campaign = await prisma.campaign.findFirst({
      where: {
        name: {
          equals: campaignName,
          mode: "insensitive", // 대소문자 구분 없이 검색
        },
      },
    });

    // console.log("campaign:", campaign);

    if (!campaign) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "Campaign with the specified name does not exist"
      );
    }

    const userQuizLog = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: campaign.id,
      },
    });

    // console.log("userQuizLog:", userQuizLog);

    if (!userQuizLog) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        "No quiz log found for the given user and campaign"
      );
    }

    const userQuizStageLogs = await prisma.userQuizStageLog.findMany({
      where: {
        userId: userId,
        quizSetId: userQuizLog.quizSetId,
      },
    });

    // console.log("userQuizStageLogs:", userQuizStageLogs);

    const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
      where: {
        userId: userId,
        quizSetId: userQuizLog.quizSetId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(
      {
        item: {
          quizLog: userQuizLog,
          quizStageLogs: userQuizStageLogs,
          quizQuestionLogs: userQuizQuestionLogs,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    Sentry.captureException(error);

    // ApiError에 대한 특수 처리
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          status: error.statusCode,
          message: error.message,
          error: {
            code: error.statusCode === 400 ? "BAD_REQUEST" : "NOT_FOUND",
            details: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // const url = request.url;
    // const { searchParams } = new URL(url);
    // const quizsetPath = searchParams.get("quizset_path");
    // console.log("quizSet post", quizsetPath);

    const body = await request.json();
    const { userId, quizsetPath } = body;

    if (!quizsetPath) {
      Sentry.captureMessage("Quiz set path is required");
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "Quiz set path is required",
          },
        },
        { status: 400 }
      );
    }

    const { domainCode, languageCode } = extractCodesFromPath(quizsetPath);

    console.log("domainCode", domainCode);
    console.log("languageCode", languageCode);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
      include: {
        subsidary: {
          include: {
            region: true,
          },
        },
      },
    });

    // console.log("domain:", domain);
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          message: "User not found",
          error: {
            code: "NOT_FOUND",
            details: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id: user?.jobId ?? sumtotalUserOthersJobId,
      },
    });

    const language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    console.log("language:", language);

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: {
          has: job?.code,
        },
      },
      include: {
        quizStages: true, // Include quizStages
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

    console.log("user:", user);

    const result = await prisma.$transaction(async (tx) => {
      const userQuizLog = await tx.userQuizLog.create({
        data: {
          userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId: quizSet.campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: quizsetPath,

          domainId: domain?.id,
          regionId: domain?.subsidary?.region?.id ?? user?.regionId,
          subsidaryId: domain?.subsidary?.id ?? user?.subsidaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });

      const userQuizStatistics = await tx.userQuizStatistics.create({
        data: {
          id: userQuizLog.id,
          userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId: quizSet.campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: quizsetPath,

          domainId: domain?.id,
          regionId: domain?.subsidary?.region?.id ?? user?.regionId,
          subsidaryId: domain?.subsidary?.id ?? user?.subsidaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });

      return { userQuizLog, userQuizStatistics };
    });

    console.log("userQuizLog:", result.userQuizLog);
    console.log("userQuizStatistics:", result.userQuizStatistics);

    return NextResponse.json(
      {
        item: {
          quizLog: result.userQuizLog,
        },
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error creating user campaign domain log:", e);
    Sentry.captureException(e);
    return NextResponse.json({ error: e }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
