import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // const questionsLogs: UserQuizQuestionLog[] =
    //   await prisma.userQuizQuestionLog.findMany({
    //     where: {
    //       campaignId: body.campaignId,
    //       userId: body.userId,
    //       quizSetId: body.quizSetId,
    //       quizStageIndex: body.quizStageIndex,
    //     },
    //   });

    // console.log("questionsLogs", questionsLogs);

    // const totalElapsedSeconds = questionsLogs.reduce(
    //   (total, log) => total + log.elapsedSeconds,
    //   0
    // );

    // if (questionsLogs.length === 0) {
    //   return NextResponse.json(
    //     {
    //       status: 404,
    //       message: "questionsLogs Not found",
    //       error: {
    //         code: "NOT_FOUND",
    //         details: "Fail create quiz stage log",
    //       },
    //     },
    //     { status: 404 }
    //   );
    // }

    // const quizScoreCalculator = new QuizScoreCalculator();
    // const score = quizScoreCalculator.calculateStageScore(
    //   questionsLogs,
    //   body.remainingHearts
    // );

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
    } = body;

    const quizLog = await await prisma.userQuizLog.findFirst({
      where: {
        quizSetId,
      },
    });

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
        domainId: quizLog?.domainId!,
        languageId: quizLog?.languageId,
        jobId: quizLog?.jobId!,
        regionId: quizLog?.regionId,
        subsidaryId: quizLog?.subsidaryId,
        channelSegmentId: quizLog?.channelSegmentId,
        storeId: quizLog?.storeId,
        channelId: quizLog?.channelId,
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
          domainId: quizLog?.domainId,
          languageId: quizLog?.languageId,
          jobId: quizLog?.jobId,
          regionId: quizLog?.regionId,
          subsidaryId: quizLog?.subsidaryId,
          channelSegmentId: quizLog?.channelSegmentId,
          storeId: quizLog?.storeId,
          channelId: quizLog?.channelId,
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
