import { UserQuizLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

interface CreateQuizLogParams {
  userId: string;
  quizSetPath: string;
}

interface UpdateQuizSummaryLogParams {
  quizStageIndex: number;
  isBadgeAcquired: boolean;
  totalScore: number | null;
  elapsedSeconds: number | null;
  quizLogId: string;
  quizStagesLength: number;
}

export class QuizLogHandler {
  create = async (params: CreateQuizLogParams): Promise<UserQuizLog | null> => {
    const { userId, quizSetPath } = params;
    try {
      // console.log("createQuizLog started", userId);
      const initHistoryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, quizSetPath }),
        }
      );

      if (!initHistoryResponse.ok) {
        console.error(
          "Failed to initialize quiz history:",
          initHistoryResponse
        );
        return null;
      }

      const initHistoryData = await initHistoryResponse.json();
      const newQuizLog = initHistoryData.item.quizLog;

      return newQuizLog;
    } catch (error) {
      console.error("Failed to initialize quiz history:", error);
      Sentry.captureException(error, (scope) => {
        scope.setContext("operation", {
          type: "http_request",
          endpoint: "/api/logs/quizzes/sets",
          method: "POST",
          description: "Failed to initialize quiz history",
        });
        scope.setTag("userId", userId);
        scope.setTag("quizSetPath", quizSetPath);
        return scope;
      });
      return null;
    }
  };

  update = async (params: UpdateQuizSummaryLogParams): Promise<UserQuizLog> => {
    const {
      quizStageIndex,
      isBadgeAcquired,
      totalScore,
      elapsedSeconds,
      quizLogId,
      quizStagesLength,
    } = params;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/logs/quizzes/sets/${quizLogId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lastCompletedStage: quizStageIndex,
            isCompleted: quizStageIndex === quizStagesLength - 1,
            isBadgeAcquired,
            score: totalScore,
            elapsedSeconds: elapsedSeconds,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user profile");
      }

      const data = await response.json();
      return data.item as UserQuizLog;
    } catch (error) {
      console.error("Error updateQuizSummaryLog:", error);
      Sentry.captureException(error, (scope) => {
        scope.setContext("operation", {
          type: "http_request",
          endpoint: "/api/logs/quizzes/sets/[quizLogId]",
          method: "POST",
          description: "Failed to update quiz summary log",
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
