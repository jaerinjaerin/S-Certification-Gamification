import { prisma } from "@/prisma-client";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    quizset_path: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const quizsetPath = props.params.quizset_path;
    console.log("quizsetPath", quizsetPath);

    if (!quizsetPath) {
      return NextResponse.json(
        {
          status: 400,
          message: "Bad request",
          error: {
            code: "BAD_REQUEST",
            details: "Invalid quiz set ID",
          },
        },
        { status: 400 }
      );
    }

    const result = await prisma.campaignDomainQuizSet.findFirst({
      where: {
        path: {
          equals: quizsetPath,
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

    console.log("result:", result);

    // Fetch questions for each quizStage
    const stagesWithQuestions = await Promise.all(
      result?.quizStages.map(async (stage) => {
        const questionIds = JSON.parse(stage.questionIds || "[]");
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

        return {
          ...stage,
          questions, // Add questions with options to the stage
        };
      }) || []
    );

    // Return the combined result
    // return NextResponse.json(
    //   {
    //     item: {
    //       ...result,
    //       quizStages: stagesWithQuestions,
    //     },
    //   },
    //   { status: 200 }
    // );

    const response = NextResponse.json(
      {
        item: {
          ...result,
          quizStages: stagesWithQuestions,
        },
      },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  } catch (error) {
    console.error("Error fetching question data:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
