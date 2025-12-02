import { auth } from "@/auth";
import {
  defaultLanguageCode,
  sumtotalUserOthersJobId,
} from "@/core/config/default";
import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { AuthType, Campaign } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // console.log("POST - QuizSet Log");
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId, quizSetPath, campaignId } = body;

  try {
    if (!quizSetPath || !campaignId || !userId) {
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

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
      },
    });

    if (campaign == null) {
      return NextResponse.json(
        {
          status: 404,
          message: "Not found",
          error: {
            code: "NOT_FOUND",
            details: "Campaign not found",
          },
        },
        { status: 404 }
      );
    }

    const codes = extractCodesFromPath(quizSetPath);
    if (codes == null) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "Invalid quizset path",
          },
        },
        { status: 400 }
      );
    }
    const { domainCode, languageCode } = codes;

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

    if (campaign.name.toLowerCase() !== "s25") {
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

        return NextResponse.json(
          {
            status: 404,
            message: "Not found",
            error: {
              code: "NOT_FOUND",
              details: "Language not found",
            },
          },
          { status: 404 }
        );
      }

      const quizSet = await prisma.quizSet.findFirst({
        where: {
          domainId: domain?.id,
          campaignId,
          languageId: language?.id,
          jobCodes: {
            has: job?.code,
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

      // // console.log("user:", user);

      let userQuizLog = await prisma.userQuizLog.findFirst({
        where: {
          userId: userId,
          campaignId: quizSet.campaignId,
        },
      });

      if (userQuizLog) {
        console.warn("Warn already exists user quiz log:", userQuizLog);
        userQuizLog = await prisma.userQuizLog.update({
          where: {
            id: userQuizLog.id,
          },
          data: {
            // userId: userId,
            authType: user?.authType || AuthType.UNKNOWN,
            campaignId,
            isCompleted: false,
            isBadgeAcquired: false,

            jobId: job?.id,
            quizSetId: quizSet.id,
            languageId: language?.id,
            quizSetPath: quizSetPath,

            domainId: domain?.id,
            regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
            subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

            storeId: user?.storeId,
            storeSegmentText: user?.storeSegmentText,
            channelId: user?.channelId,
            channelName: user?.channelName,
            channelSegmentId: user?.channelSegmentId,
          },
        });
      } else {
        userQuizLog = await prisma.userQuizLog.create({
          data: {
            userId: userId,
            authType: user?.authType || AuthType.UNKNOWN,
            campaignId,
            isCompleted: false,
            isBadgeAcquired: false,

            jobId: job?.id,
            quizSetId: quizSet.id,
            languageId: language?.id,
            quizSetPath: quizSetPath,

            domainId: domain?.id,
            regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
            subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

            storeId: user?.storeId,
            storeSegmentText: user?.storeSegmentText,
            channelId: user?.channelId,
            channelName: user?.channelName,
            channelSegmentId: user?.channelSegmentId,
          },
        });
      }

      let userQuizStatistics = await prisma.userQuizStatistics.findFirst({
        where: {
          userId: userId,
          campaignId: quizSet.campaignId,
        },
      });

      if (userQuizStatistics) {
        userQuizStatistics = await prisma.userQuizStatistics.update({
          where: {
            id: userQuizStatistics.id,
          },
          data: {
            // userId: userId,
            authType: user?.authType || AuthType.UNKNOWN,
            campaignId,
            isCompleted: false,
            isBadgeAcquired: false,

            jobId: job?.id,
            quizSetId: quizSet.id,
            languageId: language?.id,
            quizSetPath: quizSetPath,

            domainId: domain?.id,
            regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
            subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

            storeId: user?.storeId,
            storeSegmentText: user?.storeSegmentText,
            channelId: user?.channelId,
            channelName: user?.channelName,
            channelSegmentId: user?.channelSegmentId,
          },
        });
      } else {
        userQuizStatistics = await prisma.userQuizStatistics.create({
          data: {
            userId: userId,
            authType: user?.authType || AuthType.UNKNOWN,
            campaignId,
            isCompleted: false,
            isBadgeAcquired: false,

            jobId: job?.id,
            quizSetId: quizSet.id,
            languageId: language?.id,
            quizSetPath: quizSetPath,

            domainId: domain?.id,
            regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
            subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

            storeId: user?.storeId,
            storeSegmentText: user?.storeSegmentText,
            channelId: user?.channelId,
            channelName: user?.channelName,
            channelSegmentId: user?.channelSegmentId,
          },
        });
      }

      return NextResponse.json(
        {
          item: {
            quizLog: userQuizLog,
          },
        },
        { status: 200 }
      );
    }

    // DEPRECATED: 구버전 (S25) 캠페인 로직입니다.
    // 대체 로직은 위의 로직을 사용
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
        campaignId,
        jobCodes: {
          has: job?.code,
        },
      },
      // include: {
      //   quizStages: {
      //     include: {
      //       badgeImage: true, // Include badgeImage relation in quizStages
      //     },
      //   },
      // },
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

    let userQuizLog = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: quizSet.campaignId,
      },
    });

    if (userQuizLog) {
      console.warn("Warn already exists user quiz log:", userQuizLog);
      userQuizLog = await prisma.userQuizLog.update({
        where: {
          id: userQuizLog.id,
        },
        data: {
          // userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });
    } else {
      userQuizLog = await prisma.userQuizLog.create({
        data: {
          userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });
    }

    let userQuizStatistics = await prisma.userQuizStatistics.findFirst({
      where: {
        userId: userId,
        campaignId: quizSet.campaignId,
      },
    });

    if (userQuizStatistics) {
      userQuizStatistics = await prisma.userQuizStatistics.update({
        where: {
          id: userQuizStatistics.id,
        },
        data: {
          // userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });
    } else {
      userQuizStatistics = await prisma.userQuizStatistics.create({
        data: {
          userId: userId,
          authType: user?.authType || AuthType.UNKNOWN,
          campaignId,
          isCompleted: false,
          isBadgeAcquired: false,

          jobId: job?.id,
          quizSetId: quizSet.id,
          languageId: language?.id,
          quizSetPath: confirmedQuizSetPath,

          domainId: domain?.id,
          regionId: domain?.subsidiary?.region?.id ?? user?.regionId,
          subsidiaryId: domain?.subsidiaryId ?? user?.subsidiaryId,

          storeId: user?.storeId,
          storeSegmentText: user?.storeSegmentText,
          channelId: user?.channelId,
          channelName: user?.channelName,
          channelSegmentId: user?.channelSegmentId,
        },
      });
    }

    return NextResponse.json(
      {
        item: {
          quizLog: userQuizLog,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error creating user quiz log:", error);
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/logs/quizzes/sets",
        method: "POST",
        description: "Failed to create user quiz log",
      });
      scope.setTag("userId", userId);
      scope.setTag("quizSetPath", quizSetPath);
      return scope;
    });

    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // const campaign = await prisma.campaign.findFirst({
    //   where: {
    //     name: {
    //       equals: campaignName,
    //       mode: "insensitive", // 대소문자 구분 없이 검색
    //     },
    //   },
    // });
    let campaign: Campaign | null = null;
    if (campaignName.toLowerCase() !== "s25") {
      campaign = await prisma.campaign.findFirst({
        where: {
          slug: {
            equals: campaignName,
            mode: "insensitive", // 대소문자 구분 없이 검색
          },
        },
      });
    } else {
      campaign = await prisma.campaign.findFirst({
        where: {
          name: {
            equals: campaignName,
            mode: "insensitive", // 대소문자 구분 없이 검색
          },
        },
      });
    }

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
    console.error("API Get - QuizSet :", campaignName, userId, error);

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
