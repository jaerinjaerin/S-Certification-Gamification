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

    const userQuizStageLog = await prisma.userQuizStageLog.create({
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

    const userQuizBadgeStageLog = await prisma.userQuizBadgeStageLog.findFirst({
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
          quizSetId,
          isBadgeAcquired,
          badgeActivityId,
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
          quizSetId,
          isBadgeAcquired,
          badgeActivityId,
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
