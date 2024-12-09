import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      isCorrect,
      campaignId,
      userId,
      quizSetId,
      questionId,
      languageId,
      selectedOptionIds,
      jobId,
      domainId,
      stageIndex,
      category,
      specificFeature,
      product,
      questionType,
      elapsedSeconds,
      score,
    } = body;

    // await prisma.userQuizQuestionLog.create({
    //   data: {
    //     isCorrect,
    //     campaignId,
    //     userId,
    //     quizSetId,
    //     questionId,
    //     languageId,
    //     selectedOptionIds,
    //     jobId,
    //     domainId,
    //     stageIndex,
    //     category,
    //     specificFeature,
    //     product,
    //     questionType,
    //     elapsedSeconds,
    //     score,
    //   },
    // });
  } catch (error) {
    console.error("Error register user quiz log:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
