import { auth } from "@/auth";
import {
  defaultLanguageCode,
  sumtotalUserOthersJobId,
} from "@/core/config/default";
import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { AuthType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // console.log("POST - QuizSet Log");
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, quizSetPath } = body;

  try {
    // const url = request.url;
    // const { searchParams } = new URL(url);
    // const quizsetPath = searchParams.get("quizset_path");
    // // console.log("quizSet post", quizsetPath);

    if (!quizSetPath) {
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

    const { domainCode, languageCode } = extractCodesFromPath(quizSetPath);

    // console.log("domainCode", domainCode);
    // console.log("languageCode", languageCode);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!domain) {
      Sentry.captureException(new Error("Domain not found"), (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "/api/logs/quizzes/sets",
          method: "POST",
          description: "Domain not found",
        });
        scope.setTag("userId", userId);
        scope.setTag("quizSetPath", quizSetPath);
        return scope;
      });

      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Domain not found",
          },
        },
        { status: 404 }
      );
    }

    // // console.log("domain:", domain);
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      Sentry.captureException(new Error("User not found"), (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "/api/logs/quizzes/sets",
          method: "POST",
          description: "User not found",
        });
        scope.setTag("userId", userId);
        scope.setTag("quizSetPath", quizSetPath);
        return scope;
      });

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

    let language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    if (!language) {
      Sentry.captureMessage("Language not found", (scope) => {
        scope.setContext("operation", {
          type: "api",
          endpoint: "/api/logs/quizzes/sets",
          method: "POST",
          description: "Language not found",
        });
        scope.setTag("userId", userId);
        scope.setTag("quizSetPath", quizSetPath);
        return scope;
      });

      language = await prisma.language.findFirst({
        where: {
          code: defaultLanguageCode,
        },
      });
    }

    let confirmedQuizSetPath = quizSetPath;
    if (language != null && language.code !== languageCode) {
      confirmedQuizSetPath = `${domainCode}_${language.code}`;
    }

    // // console.log("language:", language);

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: {
          has: job?.code,
        },
      },
      include: {
        quizStages: {
          include: {
            badgeImage: true, // Include badgeImage relation in quizStages
          },
        },
      },
    });

    // // console.log("quizSet:", quizsetPath, quizSet);

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

    // // console.log("user:", user);

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
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiary?.id ?? user?.subsidiaryId,

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
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiary?.id ?? user?.subsidiaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });

      return { userQuizLog, userQuizStatistics };
    });

    // // console.log("userQuizLog:", result.userQuizLog);
    // // console.log("userQuizStatistics:", result.userQuizStatistics);

    return NextResponse.json(
      {
        item: {
          quizLog: result.userQuizLog,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error creating user campaign domain log:", error);
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/logs/quizzes/sets",
        method: "POST",
        description: "Failed to create user campaign domain log",
      });
      scope.setTag("userId", userId);
      scope.setTag("quizSetPath", quizSetPath);
      return scope;
    });

    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  // export async function GET(request: NextRequest) {
  // console.log("GET - QuizSet Log");
  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  const url = request.url;
  const { searchParams } = new URL(url);
  const userId = searchParams.get("user_id");
  const campaignName = searchParams.get("campaign_name");

  try {
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

    // // console.log("campaign:", campaign);

    if (!campaign) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        `Campaign with the specified name does not exist: ${campaignName}`
      );
    }

    const userQuizLog = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: campaign.id,
      },
    });

    // // console.log("userQuizLog:", userQuizLog);

    if (!userQuizLog) {
      // throw new ApiError(
      //   204,
      //   "NOT_FOUND",
      //   "No quiz log found for the given user and campaign"
      // );
      // return NextResponse.json(null, { status: 204 });
      return NextResponse.json(
        {
          item: {
            quizLog: null,
            quizStageLogs: [],
            // quizQuestionLogs: [],
          },
        },
        { status: 200 }
      );
    }

    const userQuizStageLogs = await prisma.userQuizStageLog.findMany({
      where: {
        userId: userId,
        quizSetId: userQuizLog.quizSetId,
      },
    });

    // // console.log("userQuizStageLogs:", userQuizStageLogs);

    // const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
    //   where: {
    //     userId: userId,
    //     quizSetId: userQuizLog.quizSetId,
    //   },
    //   orderBy: {
    //     createdAt: "asc",
    //   },
    // });

    // const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
    //   where: {
    //     userId: userId,
    //     quizSetId: userQuizLog.quizSetId,
    //   },
    //   orderBy: [
    //     {
    //       questionId: "asc", // questionId를 기준으로 정렬
    //     },
    //     {
    //       createdAt: "desc", // 최신 항목을 우선 정렬
    //     },
    //   ],
    //   distinct: ["questionId"], // questionId별로 중복 제거
    // });

    // console.log("userQuizQuestionLogs:", userQuizQuestionLogs);

    return NextResponse.json(
      {
        item: {
          quizLog: userQuizLog,
          quizStageLogs: userQuizStageLogs,
          // quizQuestionLogs: userQuizQuestionLogs,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API Get - QuizSet :", campaignName, error);

    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/logs/quizzes/sets",
        method: "POST",
        description: "Failed to fetch quiz set data",
      });
      scope.setTag("userId", userId);
      scope.setTag("campaignName", campaignName);
      return scope;
    });

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
