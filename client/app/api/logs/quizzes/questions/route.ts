import { auth } from "@/auth";
import { ApiError } from "@/core/error/api_error";
import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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
    subsidiaryId,
    channelSegmentId,
    storeId,
    channelId,
    channelName,
    originalQuestionId,
    originalIndex,
  } = body;

  try {
    const domain = await prisma.domain.findFirst({
      where: {
        id: domainId,
      },
      include: {
        subsidiary: {
          include: {
            region: true,
          },
        },
      },
    });

    const savedUserQuizQuestionLog = await prisma.userQuizQuestionLog.findFirst(
      {
        where: {
          userId: userId as string,
          quizSetId: quizSetId as string,
          quizStageId: quizStageId as string,
          questionId: questionId as string,
        },
        orderBy: {
          createdAt: "desc",
        },
      }
    );

    let tryNumber = savedUserQuizQuestionLog?.tryNumber ?? 0;
    tryNumber += 1;

    // const result = await prisma.$transaction(async (tx) => {
    const userQuizQuestionLog = await prisma.userQuizQuestionLog.create({
      data: {
        authType,
        isCorrect,
        campaignId,
        userId,
        quizSetId,
        questionId,
        quizStageId,
        selectedOptionIds,
        correctOptionIds,
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
        regionId: domain?.subsidiary?.regionId,
        subsidiaryId: domain?.subsidiaryId,
        channelSegmentId,
        storeId,
        channelId,
        channelName,
        tryNumber,
        originalQuestionId,
        originalIndex,
      },
    });

    // const userQuizQuestionStatistics =
    await prisma.userQuizQuestionStatistics.create({
      data: {
        // id: userQuizQuestionLog.id,
        authType,
        isCorrect,
        campaignId,
        userId,
        quizSetId,
        questionId,
        quizStageId,
        selectedOptionIds,
        correctOptionIds,
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
        regionId: domain?.subsidiary?.regionId,
        subsidiaryId: domain?.subsidiaryId,
        channelSegmentId,
        storeId,
        channelId,
        channelName,
        tryNumber,
      },
    });

    //   return { userQuizQuestionLog, userQuizQuestionStatistics };
    // });

    return NextResponse.json({ item: userQuizQuestionLog }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz question log :", error);
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/logs/quizzes/questions",
        method: "POST",
        description: "Failed to create quiz question log",
      });
      scope.setTag("userId", userId);
      scope.setTag("campaignId", campaignId);
      scope.setTag("authType", authType);
      scope.setTag("quizSetId", quizSetId);
      scope.setTag("quizStageId", quizStageId);
      scope.setTag("questionId", questionId);
      return scope;
    });

    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // export async function GET(request: NextRequest) {
  // console.log("GET - QuizSet Log");
  // const session = await auth();
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  // }

  const url = request.url;
  const { searchParams } = new URL(url);
  const userId = searchParams.get("user_id");
  const quizSetId = searchParams.get("quizset_id");
  const quizStageIndex = searchParams.get("stage_index");

  try {
    if (!userId || !quizSetId || !quizStageIndex) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "quizset_id and stage_index are required"
      );
    }

    console.log("userId", userId);

    // const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
    //   where: {
    //     quizSetId: quizSetId,
    //     quizStageIndex: Number(quizStageIndex),
    //     tryNumber: 1,
    //   },
    //   orderBy: [
    //     {
    //       questionId: "asc", // questionId를 기준으로 정렬
    //     },
    //     {
    //       createdAt: "desc", // 최신 항목을 우선 정렬
    //     },
    //   ],
    //   distinct: ["questionId"], // questionId별로 중복 제거
    // });

    const userQuizQuestionLogs = await prisma.userQuizQuestionLog.findMany({
      where: {
        userId: userId,
        quizSetId: quizSetId,
        quizStageIndex: Number(quizStageIndex),
      },
      orderBy: [
        {
          questionId: "asc",
        },
        {
          tryNumber: "desc", // 높은 tryNumber 우선
        },
        {
          createdAt: "desc", // 최신 데이터 우선
        },
      ],
    });

    console.log("quizSetId", quizSetId);

    // questionId 기준으로 중복 제거 (최초 등장하는 항목 유지)
    const uniqueLogs = Object.values(
      userQuizQuestionLogs.reduce((acc, log) => {
        if (!acc[log.questionId]) {
          acc[log.questionId] = log;
        }
        return acc;
      }, {} as Record<string, (typeof userQuizQuestionLogs)[number]>)
    );

    return NextResponse.json(
      {
        items: uniqueLogs,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "/api/logs/quizzes/questions",
        method: "GET",
        description: "Failed to fetch quiz set data",
      });
      scope.setTag("ququizSetId", quizSetId);
      scope.setTag("quizStageIndex", quizStageIndex);
      return scope;
    });

    // ApiError에 대한 특수 처리
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          status: error.statusCode,
          message: error.message,
          error: {
            code: error.statusCode === 400 ? "BAD_REQUEST" : "NOT_FOUND",
            details: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

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
