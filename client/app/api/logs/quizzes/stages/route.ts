import { auth } from "@/auth";
import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // // console.log("body", body);

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

    function generateRandomNumber(length) {
      if (length <= 0) {
        throw new Error("Length must be a positive integer.");
      }

      let randomNumber = "";
      while (randomNumber.length < length) {
        const chunk = Math.random().toString().slice(2); // "0." 이후의 숫자만 가져옴
        randomNumber += chunk;
      }

      return randomNumber.slice(0, length); // 정확히 length만큼 반환
    }

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
        },
      });

      const userQuizStageStatistics = await tx.userQuizStageStatistics.create({
        data: {
          // id: userQuizStageLog.id,
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
        },
      });

      // // console.log("userQuizStageLog", userQuizStageLog);

      if (!isBadgeStage) {
        return {
          userQuizStageLog,
          userQuizStageStatistics,
        };
      }

      const random100k = generateRandomNumber(100000);
      const userQuizBadgeStageLog = await tx.userQuizBadgeStageLog.create({
        data: {
          userId,
          authType,
          campaignId,
          isBadgeAcquired,
          badgeActivityId,
          quizSetId,
          quizStageId: `${quizStageId}_${random100k}`,
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

      const random100k2 = generateRandomNumber(100000);
      const userQuizBadgeStageStatistics =
        await tx.userQuizBadgeStageStatistics.create({
          data: {
            // id: userQuizBadgeStageLog.id,
            userId,
            authType,
            campaignId,
            isBadgeAcquired,
            badgeActivityId,
            quizSetId,
            quizStageId: `${quizStageId}_${random100k2}`,
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

      // // console.log("userQuizBadgeStageLog", userQuizBadgeStageLog);

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
