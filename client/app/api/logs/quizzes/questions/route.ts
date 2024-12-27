import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      isCorrect,
      campaignId,
      userId,
      authType,
      quizSetId,
      quizStageId,
      questionId,
      // languageId,
      selectedOptionIds,
      correctOptionIds,
      // jobId,
      // domainId,
      quizStageIndex,
      category,
      specificFeature,
      product,
      questionType,
      elapsedSeconds,
      createdAt,
      // score,
      domainId,
      languageId,
      jobId,
      regionId,
      subsidaryId,
      channelSegmentId,
      storeId,
      channelId,
    } = body;

    // console.log("body", body);

    // const quizLog = await await prisma.userQuizLog.findFirst({
    //   where: {
    //     quizSetId,
    //   },
    // });

    const questionLog = await prisma.userQuizQuestionLog.create({
      data: {
        authType,
        isCorrect,
        campaignId,
        userId,
        quizSetId,
        questionId,
        quizStageId,
        // languageId,
        selectedOptionIds,
        correctOptionIds,
        // jobId,
        // domainId,
        quizStageIndex,
        category,
        specificFeature,
        product,
        questionType,
        elapsedSeconds,
        createdAt,

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
        // score,
      },
    });

    return NextResponse.json({ item: questionLog }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz question log :", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const quizSetId = searchParams.get("quiz_set_id");
  const quizStageId = searchParams.get("quiz_stage_id");

  try {
    const quizLogs = await prisma.userQuizQuestionLog.findMany({
      where: {
        userId: userId as string,
        quizSetId: quizSetId as string,
        quizStageId: quizStageId as string,
      },
    });

    return NextResponse.json({ item: quizLogs }, { status: 200 });
  } catch (error) {
    console.error("Error get quiz logs :", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
