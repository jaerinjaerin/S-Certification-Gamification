import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    quizset_path: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const quizsetPath = props.params.quizset_path;
    console.log("API: quizsetPath", quizsetPath);

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

    const { domainCode, jobCode, languageCode } =
      extractCodesFromPath(quizsetPath);

    const domain = await prisma.domain.findFirst({
      where: {
        code: domainCode,
      },
    });

    // console.log("domain:", domain);

    // const job = await prisma.job.findFirst({
    //   where: {
    //     code: jobCode,
    //   },
    // });

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: {
          has: jobCode,
        },
        // paths: {
        //   has: quizsetPath, // Ensure jobId exists in the jobIds array
        // },
      },
      include: {
        quizStages: true, // Include quizStages
        // language: true,
        // campaign: true,
        // domain: true,
      },
    });

    // console.log("API: quizSet:", quizSet);

    if (!quizSet) {
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

    let language = await prisma.language.findFirst({
      where: {
        code: languageCode,
      },
    });

    // TODO: 지원 언어가 없을 경우 기본 언어로 설정
    if (!language) {
      language = await prisma.language.findFirst({
        where: {
          code: "en",
        },
      });
    }

    console.log("language:", language);

    const languageId = language?.id;

    // 각 quizStage의 questionIds를 기반으로 Question 데이터를 가져오기
    const quizStagesWithQuestions = await Promise.all(
      quizSet.quizStages.map(async (quizStage) => {
        const questions = await prisma.question.findMany({
          where: {
            originalQuestionId: {
              in: quizStage.questionIds, // Match question IDs from quizStage
            },
            languageId, // Filter by languageId
          },
          include: {
            options: true, // Include options if needed
          },
        });

        return {
          ...quizStage,
          questions, // Attach filtered questions
        };
      })
    );

    // console.log("quizStagesWithQuestions:", quizStagesWithQuestions);

    // return {
    //   ...quizSet,
    //   quizStages: quizStagesWithQuestions,
    // };

    // const result = await prisma.campaignDomainQuizSet.findFirst({
    //   where: {
    //     path: {
    //       equals: quizsetPath,
    //       mode: "insensitive", // 대소문자 구분 없이 검색
    //     },
    //   },
    //   include: {
    //     language: true,
    //     campaign: true,
    //     domain: true,
    //     quizStages: true, // Include the stages associated with the quiz set
    //   },
    // });

    // console.log("result:", result);

    // // Fetch questions for each quizStage
    // const stagesWithQuestions = await Promise.all(
    //   result?.quizStages.map(async (stage) => {
    //     const questionIds = JSON.parse(stage.questionIds || "[]");
    //     const questions = await prisma.question.findMany({
    //       where: {
    //         id: {
    //           in: questionIds,
    //         },
    //       },
    //       include: {
    //         options: true, // Include all related options for each question
    //       },
    //     });

    //     return {
    //       ...stage,
    //       questions, // Add questions with options to the stage
    //     };
    //   }) || []
    // );

    const response = NextResponse.json(
      {
        item: {
          ...quizSet,
          quizStages: quizStagesWithQuestions,
          language: language,
          domain: domain,
        },
      },
      { status: 200 }
    );
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  } catch (error) {
    console.error("Error fetching question data:", error);
    Sentry.captureException(error);

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
