import {
  defaultLanguageCode,
  sumtotalUserOthersJobId,
} from "@/core/config/default";
import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { Question } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

type Props = {
  params: {
    quizset_path: string;
  };
};

export async function GET(request: NextRequest, props: Props) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const quizsetPath = props.params.quizset_path;

  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  try {
    if (!quizsetPath || !userId) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Quiz set path and User ID are required"
      );
    }

    const { domainCode, languageCode } = extractCodesFromPath(quizsetPath);
    // console.log("domainCode:", domainCode, "languageCode:", languageCode);

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    const userJobId = user.jobId ?? sumtotalUserOthersJobId;
    console.log("userJobId:", userId);
    const job = await prisma.job.findFirst({
      where: { id: userJobId },
    });

    const domain = await prisma.domain.findFirst({
      where: { code: domainCode },
    });

    // console.log("domain:", domain, "job:", job);

    const quizSet = await prisma.quizSet.findFirst({
      where: {
        domainId: domain?.id,
        jobCodes: { has: job?.code },
      },
      include: {
        quizStages: {
          include: {
            badgeImage: true, // Include badgeImage relation in quizStages
          },
          orderBy: {
            order: "asc", // 'asc' for ascending order, use 'desc' for descending
          },
        },
      },
    });

    if (!quizSet) {
      throw new ApiError(404, "NOT_FOUND", "Quiz set not found");
    }

    // console.log("quizSet:", quizSet);

    let language = await prisma.language.findFirst({
      where: { code: languageCode },
    });

    // console.log("language:", language);

    if (!language) {
      language = await prisma.language.findFirst({
        where: { code: defaultLanguageCode },
      });
    }

    const defaultLanguage = await prisma.language.findFirst({
      where: { code: defaultLanguageCode },
    });

    // // console.log("language:", language, defaultLanguage);

    const languageId = language?.id;

    // console.log("languageId:", languageId);

    const quizStagesWithQuestions = await Promise.all(
      quizSet.quizStages.map(async (quizStage) => {
        // console.log("quizStage:", quizStage.questionIds, languageId);
        const questions = await prisma.question.findMany({
          where: {
            originalQuestionId: { in: quizStage.questionIds },
            // languageId: { in: [languageId!, defaultLanguage!.id] },
            languageId: languageId,
          },
          include: {
            options: true,
            backgroundImage: true,
            characterImage: true,
          },
        });

        questions.sort((a: Question, b: Question) => {
          return a.order - b.order;
        });

        // console.log("questions:", questions);

        // languageId 우선, 없으면 defaultLanguage.id
        const prioritizedQuestions = questions.filter(
          (q) => q.languageId === languageId
        );
        const fallbackQuestions = questions.filter(
          (q) => q.languageId === defaultLanguage!.id
        );

        return {
          ...quizStage,
          questions:
            prioritizedQuestions.length > 0
              ? prioritizedQuestions
              : fallbackQuestions,
        };
      })
    );

    // console.log("quizStagesWithQuestions:", quizStagesWithQuestions);

    return NextResponse.json(
      {
        item: {
          ...quizSet,
          quizStages: quizStagesWithQuestions,
          language,
          domain,
        },
      },
      { status: 200 }
    );
    // response.headers.set("Cache-Control", "public, max-age=3600");
    // return response;
  } catch (error) {
    console.error("Error fetching question data:", error);

    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/campaigns/quizsets/[quizset_path]",
        method: "POST",
        description: "Failed to fetch question data",
      });
      scope.setTag("user_id", userId);
      scope.setTag("quizset_path", quizsetPath);
      return scope;
    });

    // ApiError 처리
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          status: error.statusCode,
          message: error.message,
          error: {
            code: error.code,
            details: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    // 예상치 못한 에러 처리
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        error: {
          code: "INTERNAL_SERVER_ERROR",
          details:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        },
      },
      { status: 500 }
    );
  }
}
