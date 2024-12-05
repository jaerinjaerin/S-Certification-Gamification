import { prisma } from "@/prisma-client";
import { areArraysEqualUnordered } from "@/utils/validationUtils";
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

    console.log("body:", quizStageId, questionId, selectedOptionIds);

    const quizset = await prisma.campaignDomainQuizSet.findFirst({
      where: {
        path: {
          equals: quizset_path,
          mode: "insensitive", // 대소문자 구분 없이 검색
        },
      },
      include: {
        language: true,
        campaign: true,
        domain: true,
        quizStages: true, // Include the stages associated with the quiz set
      },
    });

    console.log("quizset:", quizset);

    if (!quizset) {
      return NextResponse.json(
        {
          status: 404,
          message: "Quiz set not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz set not found",
          },
        },
        { status: 404 }
      );
    }

    const quizStage = quizset.quizStages.find((stage) => stage.id === quizStageId);
    if (!quizStage) {
      return NextResponse.json(
        {
          status: 404,
          message: "Quiz stage not found",
          error: {
            code: "NOT_FOUND",
            details: "Quiz stage not found",
          },
        },
        { status: 404 }
      );
    }

    const questionIds = JSON.parse(quizStage.questionIds || "[]");
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        options: true, // Include all related options for each question
      },
    });

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
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

    const correctOptionIds = question.options.filter((option) => option.isCorrect).map((option) => option.id);

    if (areArraysEqualUnordered(correctOptionIds, selectedOptionIds)) {
      // await prisma.userQuizQuestionLog.create({
      //   data: {
      //     isCorrect: true,
      //     userId: session?.user.id ?? "",
      //     questionId: questionId,
      //     languageId: quizset.languageId,
      //     selectedOptionIds: selectedOptionIds.join(","),
      //     domainId: quizset.domainId,
      //     stageIndex: quizStage.stageIndex,
      //     category: question.category,
      //     specificFeatur: question.category,
      //     enabled: question.enabled,
      //     product: question.product,
      //     questionType: question.questionType,
      //     elapsedSeconds: elapsedSeconds,
      //   },
      // });
      return NextResponse.json(
        {
          result: {
            isCorrect: true,
            questionType: question.questionType,
            correctOptions: correctOptionIds,
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
            correctOptions: correctOptionIds,
            message: "The answer is incorrect!",
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error register user quiz log:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
