import { AuthType, UserQuizLog, UserQuizStageLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

interface CreateQuizStageLogParams {
  userId: string;
  campaignId: string;
  quizSetId: string;
  quizStageIndex: number;
  quizStageId: string;
  authType: AuthType;
  score: number;
  totalScore: number;
  percentile: number | null;
  scoreRange: string | null;
  elapsedSeconds: number;
  remainingHearts: number;
  isBadgeStage: boolean;
  isBadgeAcquired: boolean;
  badgeActivityId: string | null;
  quizLog: UserQuizLog | null;
}

export class QuizStageLogHandler {
  // createQuizQuestionLogs = async (quizLogs: QuizLog[]): Promise<void> => {
  //   try {
  //     const result = Promise.all(
  //       quizLogs.map(async (quizLog) => {
  //         await fetch(
  //           `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/questions`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify(quizLog),
  //           }
  //         );
  //       })
  //     );
  //   } catch (error) {
  //     console.error("Error createQuizQuestionLogs:", error);
  //     Sentry.captureException(error);
  //     // throw new Error(
  //     //   "An unexpected error occurred while registering quiz log"
  //     // );
  //   }
  // };

  create = async (
    params: CreateQuizStageLogParams
  ): Promise<UserQuizStageLog> => {
    const {
      userId,
      campaignId,
      quizSetId,
      quizStageIndex,
      quizStageId,
      authType,
      score,
      totalScore,
      percentile,
      scoreRange,
      elapsedSeconds,
      remainingHearts,
      isBadgeStage,
      isBadgeAcquired,
      badgeActivityId,
      quizLog,
    } = params;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            authType: authType,
            quizSetId: quizSetId,
            quizStageIndex: quizStageIndex,
            quizStageId: quizStageId,
            isCompleted: true,
            isBadgeStage,
            isBadgeAcquired,
            badgeActivityId,
            remainingHearts,
            score,
            percentile,
            scoreRange,
            totalScore,
            elapsedSeconds,
            campaignId,
            domainId: quizLog?.domainId,
            languageId: quizLog?.languageId,
            jobId: quizLog?.jobId || "",
            regionId: quizLog?.regionId,
            subsidiaryId: quizLog?.subsidiaryId,
            storeId: quizLog?.storeId,
            channelId: quizLog?.channelId,
            channelName: quizLog?.channelName,
            channelSegmentId: quizLog?.channelSegmentId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create quiz stage log");
      }

      const data = await response.json();
      return data.item as UserQuizStageLog;
    } catch (error) {
      console.error("Error createQuizStageLog:", error);
      Sentry.captureException(error, (scope) => {
        scope.setContext("operation", {
          type: "http_request",
          endpoint: "/api/logs/quizzes/stages",
          method: "POST",
          description: "Failed to create quiz stage log",
        });
        scope.setTag("quizStageIndex", quizStageIndex);
        scope.setTag("isBadgeAcquired", isBadgeAcquired);
        return scope;
      });
      throw new Error(
        "An unexpected error occurred while registering quiz log"
      );
    }
  };
}
