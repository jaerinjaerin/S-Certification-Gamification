import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      userId,
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

      domainId,
      languageId,
      jobId,
      regionId,
      subsidaryId,
      channelSegmentId,
      storeId,
      channelId,
    } = body;

    // const quizLog = await await prisma.userQuizLog.findFirst({
    //   where: {
    //     quizSetId,
    //   },
    // });

    const quizStageLog = await await prisma.userQuizStageLog.create({
      data: {
        userId,
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
        domainId,
        languageId,
        jobId,
        regionId,
        subsidaryId,
        channelSegmentId,
        storeId,
        channelId,
        // domainId: quizLog?.domainId!,
        // languageId: quizLog?.languageId,
        // jobId: quizLog?.jobId!,
        // regionId: quizLog?.regionId,
        // subsidaryId: quizLog?.subsidaryId,
        // channelSegmentId: quizLog?.channelSegmentId,
        // storeId: quizLog?.storeId,
        // channelId: quizLog?.channelId,
      },
    });

    if (isBadgeStage) {
      await await prisma.userQuizBadgeStageLog.create({
        data: {
          userId,
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
