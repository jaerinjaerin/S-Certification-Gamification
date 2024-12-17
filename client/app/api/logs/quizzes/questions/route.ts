import { prisma } from "@/prisma-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      isCorrect,
      campaignId,
      userId,
      quizSetId,
      quizStageId,
      questionId,
      languageId,
      selectedOptionIds,
      correctOptionIds,
      jobId,
      domainId,
      stageIndex,
      category,
      specificFeature,
      product,
      questionType,
      elapsedSeconds,
      createdAt,
      // score,
    } = body;

    console.log("body", body);

    const questionLog = await prisma.userQuizQuestionLog.create({
      data: {
        isCorrect,
        campaignId,
        userId,
        quizSetId,
        questionId,
        quizStageId,
        languageId,
        selectedOptionIds,
        correctOptionIds,
        jobId,
        domainId,
        stageIndex,
        category,
        specificFeature,
        product,
        questionType,
        elapsedSeconds,
        createdAt,
        // score,
      },
    });

    return NextResponse.json({ item: questionLog }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz question log :", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
