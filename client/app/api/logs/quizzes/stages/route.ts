import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // const questionsLogs: UserQuizQuestionLog[] =
    //   await prisma.userQuizQuestionLog.findMany({
    //     where: {
    //       campaignId: body.campaignId,
    //       userId: body.userId,
    //       quizSetId: body.quizSetId,
    //       stageIndex: body.stageIndex,
    //     },
    //   });

    // console.log("questionsLogs", questionsLogs);

    // const totalElapsedSeconds = questionsLogs.reduce(
    //   (total, log) => total + log.elapsedSeconds,
    //   0
    // );

    // if (questionsLogs.length === 0) {
    //   return NextResponse.json(
    //     {
    //       status: 404,
    //       message: "questionsLogs Not found",
    //       error: {
    //         code: "NOT_FOUND",
    //         details: "Fail create quiz stage log",
    //       },
    //     },
    //     { status: 404 }
    //   );
    // }

    // const quizScoreCalculator = new QuizScoreCalculator();
    // const score = quizScoreCalculator.calculateStageScore(
    //   questionsLogs,
    //   body.remainingHearts
    // );

    // const {
    //   campaignId,
    //   userId,
    //   jobId,
    //   domainId,
    //   quizSetId,
    //   quizStageId,
    //   isCompleted,
    //   isBadgeStage,
    //   remainingHearts,
    //   isBadgeAcquired,
    //   badgeActivityId,
    //   elapsedSeconds,
    //   score,
    // } = body;

    const log = await await prisma.userQuizStageLog.create({
      data: body,
    });

    return NextResponse.json({ item: log }, { status: 200 });
  } catch (error) {
    console.error("Error create quiz stage log:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
