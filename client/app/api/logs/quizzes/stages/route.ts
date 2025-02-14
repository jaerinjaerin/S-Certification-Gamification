import { auth } from "@/auth";
import { ApiError } from "@/core/error/api_error";
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
      channelSegmentId,
      storeId,
      channelId,
      channelName,
    } = body;

    // function generateRandomNumber(length) {
    //   if (length <= 0) {
    //     throw new Error("Length must be a positive integer.");
    //   }

    //   let randomNumber = "";
    //   while (randomNumber.length < length) {
    //     const chunk = Math.random().toString().slice(2); // "0." 이후의 숫자만 가져옴
    //     randomNumber += chunk;
    //   }

    //   return randomNumber.slice(0, length); // 정확히 length만큼 반환
    // }

    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
      },
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    const userQuizStageLog = await prisma.userQuizStageLog.findFirst({
      where: {
        userId,
        campaignId,
        quizStageId,
      },
    });

    if (!userQuizStageLog) {
      await prisma.userQuizStageLog.create({
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
          regionId: domain?.subsidiary?.regionId,
          subsidiaryId: domain?.subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });
    } else {
      await prisma.userQuizStageLog.update({
        where: {
          id: userQuizStageLog.id,
        },
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
          regionId: domain?.subsidiary?.regionId,
          subsidiaryId: domain?.subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });
    }

    const userQuizStageStatistics =
      await prisma.userQuizStageStatistics.findFirst({
        where: {
          userId,
          campaignId,
          quizStageId,
        },
      });

    if (!userQuizStageStatistics) {
      await prisma.userQuizStageStatistics.create({
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
          regionId: domain?.subsidiary?.regionId,
          subsidiaryId: domain?.subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });
    } else {
      await prisma.userQuizStageStatistics.update({
        where: {
          id: userQuizStageStatistics.id,
        },
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
          regionId: domain?.subsidiary?.regionId,
          subsidiaryId: domain?.subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });
    }

    if (isBadgeStage) {
      const userQuizBadgeStageLog =
        await prisma.userQuizBadgeStageLog.findFirst({
          where: {
            userId,
            quizSetId,
            quizStageId,
          },
        });

      if (!userQuizBadgeStageLog) {
        await prisma.userQuizBadgeStageLog.create({
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
            regionId: domain?.subsidiary?.regionId,
            subsidiaryId: domain?.subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
          },
        });
      } else {
        await prisma.userQuizBadgeStageLog.update({
          where: {
            id: userQuizBadgeStageLog.id,
          },
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
            regionId: domain?.subsidiary?.regionId,
            subsidiaryId: domain?.subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
          },
        });
      }

      const userQuizBadgeStageStatistics =
        await prisma.userQuizBadgeStageStatistics.findFirst({
          where: {
            userId,
            quizSetId,
            quizStageId,
          },
        });

      if (!userQuizBadgeStageStatistics) {
        await prisma.userQuizBadgeStageStatistics.create({
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
            regionId: domain?.subsidiary?.regionId,
            subsidiaryId: domain?.subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
          },
        });
      } else {
        await prisma.userQuizBadgeStageStatistics.update({
          where: {
            id: userQuizBadgeStageStatistics.id,
          },
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
            regionId: domain?.subsidiary?.regionId,
            subsidiaryId: domain?.subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
          },
        });
      }
    }

    return NextResponse.json({ item: userQuizStageLog }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz stage log:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = request.url;
  const { searchParams } = new URL(url);
  const quizSetId = searchParams.get("quizset_id");
  const quizStageIndex = searchParams.get("quizstage_index");

  if (!quizSetId || !quizStageIndex) {
    return NextResponse.json(
      {
        status: 400,
        message: "Bad Request",
        error: {
          code: "BAD_REQUEST",
          details: "Quiz set ID and quiz stage index are required",
        },
      },
      { status: 400 }
    );
  }

  try {
    const userQuizStageLog = await prisma.userQuizStageLog.findFirst({
      where: {
        quizStageIndex: Number(quizStageIndex),
        quizSetId: quizSetId,
      },
    });

    return NextResponse.json(
      {
        item: userQuizStageLog,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API Get - QuizStagelog :", error);

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
