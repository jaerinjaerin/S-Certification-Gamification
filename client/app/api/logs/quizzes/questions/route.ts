import { prisma } from "@/prisma-client";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
  } = body;

  try {
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

    // const userQuizQuestionLog = await prisma.userQuizQuestionLog.create({
    //   data: {
    //     authType,
    //     isCorrect,
    //     campaignId,
    //     userId,
    //     quizSetId,
    //     questionId,
    //     quizStageId,
    //     selectedOptionIds,
    //     correctOptionIds,
    //     quizStageIndex,
    //     category,
    //     specificFeature,
    //     product,
    //     questionType,
    //     elapsedSeconds,
    //     createdAt,

    //     domainId,
    //     languageId,
    //     jobId,
    //     regionId,
    //     subsidiaryId,
    //     channelSegmentId,
    //     storeId,
    //     channelId,
    //     channelName,
    //   },
    // });

    const result = await prisma.$transaction(async (tx) => {
      const userQuizQuestionLog = await tx.userQuizQuestionLog.create({
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
          regionId,
          subsidiaryId,
          channelSegmentId,
          storeId,
          channelId,
          channelName,
          tryNumber,
        },
      });

      const userQuizQuestionStatistics =
        await tx.userQuizQuestionStatistics.create({
          data: {
            id: userQuizQuestionLog.id,
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
            regionId,
            subsidiaryId,
            channelSegmentId,
            storeId,
            channelId,
            channelName,
            tryNumber,
          },
        });

      return { userQuizQuestionLog, userQuizQuestionStatistics };
    });

    return NextResponse.json(
      { item: result.userQuizQuestionLog },
      { status: 200 }
    );
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

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get("user_id");
//   const quizSetId = searchParams.get("quiz_set_id");
//   const quizStageId = searchParams.get("quiz_stage_id");

//   try {
//     const quizLogs = await prisma.userQuizQuestionLog.findMany({
//       where: {
//         userId: userId as string,
//         quizSetId: quizSetId as string,
//         quizStageId: quizStageId as string,
//       },
//     });

//     return NextResponse.json({ item: quizLogs }, { status: 200 });
//   } catch (error) {
//     console.error("Error get quiz logs :", error);
//     Sentry.captureException(error);
//     return NextResponse.json(
//       { message: "An unexpected error occurred" },
//       { status: 500 }
//     );
//   }
// }
