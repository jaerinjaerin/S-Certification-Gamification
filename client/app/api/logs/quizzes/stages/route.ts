import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("body", body);

    const {
      userId,
      authType,
      campaignId,
      quizStageId,
      isBadgeStage,
      isBadgeAcquired,
      badgeActivityId,
      remainingHearts,
      quizSetId,
      quizStageIndex,
      elapsedSeconds,
      score,
      totalScore,
      percentile,
      scoreRange,
      domainId,
      languageId,
      jobId,
      regionId,
      subsidiaryId,
      channelSegmentId,
      storeId,
      channelId,
      channelName,
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      const userQuizStageLog = await tx.userQuizStageLog.create({
        data: {
          userId,
          authType,
          campaignId,
          isBadgeStage,
          isBadgeAcquired,
          badgeActivityId,
          remainingHearts,
          quizSetId,
          quizStageId,
          quizStageIndex,
          elapsedSeconds,
          score,
          percentile,
          scoreRange,
          domainId,
          languageId,
          jobId,
          regionId,
          subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });

      const userQuizStageStatistics = await tx.userQuizStageStatistics.create({
        data: {
          id: userQuizStageLog.id,
          userId,
          authType,
          campaignId,
          isBadgeStage,
          isBadgeAcquired,
          badgeActivityId,
          remainingHearts,
          quizSetId,
          quizStageId,
          quizStageIndex,
          elapsedSeconds,
          score,
          percentile,
          scoreRange,
          domainId,
          languageId,
          jobId,
          regionId,
          subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });

      console.log("userQuizStageLog", userQuizStageLog);

      if (!isBadgeStage) {
        return {
          userQuizStageLog,
          userQuizStageStatistics,
        };
      }

      const userQuizBadgeStageLog = await tx.userQuizBadgeStageLog.create({
        data: {
          userId,
          authType,
          campaignId,
          isBadgeAcquired,
          badgeActivityId,
          quizSetId,
          quizStageId,
          quizStageIndex,
          elapsedSeconds,
          score: totalScore,
          domainId,
          languageId,
          jobId,
          regionId,
          subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });

      const userQuizBadgeStageStatistics =
        await tx.userQuizBadgeStageStatistics.create({
          data: {
            id: userQuizBadgeStageLog.id,
            userId,
            authType,
            campaignId,
            isBadgeAcquired,
            badgeActivityId,
            quizSetId,
            quizStageId,
            quizStageIndex,
            elapsedSeconds,
            score: totalScore,
            domainId,
            languageId,
            jobId,
            regionId,
            subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
          },
        });

      console.log("userQuizBadgeStageLog", userQuizBadgeStageLog);

      return {
        userQuizStageLog,
        userQuizStageStatistics,
        userQuizBadgeStageLog,
        userQuizBadgeStageStatistics,
      };
    });

    return NextResponse.json(
      { item: result?.userQuizStageLog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error create quiz stage log:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
