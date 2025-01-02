import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

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
      subsidaryId,
      channelSegmentId,
      storeId,
      channelId,
      channelName,
    } = body;

    const quizStageLog = await await prisma.userQuizStageLog.create({
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
        subsidaryId,
        channelSegmentId,
        storeId,
        channelId,
        channelName,
      },
    });

    if (isBadgeStage) {
      await await prisma.userQuizBadgeStageLog.create({
        data: {
          userId,
          authType,
          campaignId,
          isBadgeAcquired,
          badgeActivityId,
          quizSetId,
          quizStageId,
          quizStageIndex,
          elapsedSeconds: elapsedSeconds,
          score: totalScore,
          domainId,
          languageId,
          jobId,
          regionId,
          subsidaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
        },
      });
    }

    return NextResponse.json({ item: quizStageLog }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz stage log:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
