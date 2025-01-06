import { prisma } from "@/prisma-client";
import { areArraysEqualUnordered } from "@/utils/validationUtils";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

type Props = {
  params: {
    quizset_path: string;
  };
};

export async function POST(request: Request, props: Props) {
  try {
    // const session = await auth();
    const body = await request.json();

    const { quizset_path } = props.params;
    const { quizStageId, questionId, selectedOptionIds } = body;

    console.log(
      "body:",
      quizStageId,
      questionId,
      selectedOptionIds,
      quizset_path
    );

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
      },
      include: {
        options: true, // Include all related options for each question
      },
    });

    if (!question) {
      Sentry.captureMessage("Question not found");
      return NextResponse.json(
        {
          status: 404,
          message: "Question not found",
          error: {
            code: "NOT_FOUND",
            details: "Question not found",
          },
        },
        { status: 404 }
      );
    }

    const correctOptionIds = question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.id);

    if (areArraysEqualUnordered(correctOptionIds, selectedOptionIds)) {
      return NextResponse.json(
        {
          result: {
            isCorrect: true,
            questionType: question.questionType,
            correctOptionIds: correctOptionIds,
            message: "The answer is correct!",
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          result: {
            isCorrect: false,
            questionType: question.questionType,
            correctOptionIds: correctOptionIds,
            message: "The answer is incorrect!",
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error register user quiz log:", error);
    Sentry.captureException(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
