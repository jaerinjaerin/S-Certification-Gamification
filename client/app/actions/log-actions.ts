"use server";

import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import { Campaign } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

export async function getQuizLog(userId: string, campaignName: string) {
  try {
    if (!userId || !campaignName) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "User ID and Campaign Name are required"
      );
    }

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

    if (!campaign) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        `Campaign not found: ${campaignName}`
      );
    }

    const userQuizLog = await prisma.userQuizLog.findFirst({
      where: {
        userId: userId,
        campaignId: campaign.id,
      },
    });

    if (!userQuizLog) {
      return {
        status: 200,
        item: {
          quizLog: null,
          quizStageLogs: [],
        },
      };
    }

    const userQuizStageLogs = await prisma.userQuizStageLog.findMany({
      where: {
        userId: userId,
        quizSetId: userQuizLog.quizSetId,
      },
    });

    console.log("userQuizLog", userQuizLog);
    console.log("userQuizStageLogs", userQuizStageLogs);

    return {
      status: 200,
      item: {
        quizLog: userQuizLog,
        quizStageLogs: userQuizStageLogs,
      },
    };
  } catch (error: unknown) {
    console.error("🚨 Server Action Error - getQuizLog:", campaignName, error);

    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "server-action",
        function: "getQuizLog",
        description: "Failed to fetch quiz log data",
      });
      scope.setTag("userId", userId);
      scope.setTag("campaignName", campaignName);
      return scope;
    });

    if (error instanceof ApiError) {
      return {
        success: false,
        status: error.statusCode,
        message: error.message,
        error: {
          code: error.statusCode === 400 ? "BAD_REQUEST" : "NOT_FOUND",
          details: error.message,
        },
      };
    }

    return {
      success: false,
      status: 500,
      message: "Internal server error",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
    };
  }
}
