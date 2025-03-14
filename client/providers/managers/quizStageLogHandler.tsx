import {
  AuthType,
  BadgeType,
  UserQuizLog,
  UserQuizStageLog,
} from "@prisma/client";
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
  badgeType: BadgeType | null;
  quizLog: UserQuizLog | null;
}

export class QuizStageLogHandler {
  create = async (
    params: CreateQuizStageLogParams,
    tryNumber: number = 3
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
      badgeType,
      quizLog,
    } = params;

    let attempts = 0;

    while (attempts < tryNumber) {
      attempts++;
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
              badgeType,
            }),
          }
        );

        if (!response.ok) {
          // const errorData = await response.json();
          throw new Error("Failed to create quiz stage log");
        }

        const data = await response.json();
        // 성공적으로 처리되었으면 함수 종료
        return data.item;
      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);

        // 마지막 시도에서만 Sentry에 로깅
        if (attempts === tryNumber) {
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
          // await Sentry.flush(1000);

          throw new Error(
            "Max attempts reached: An unexpected error occurred while registering quiz log"
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw new Error("Failed to create quiz stage log");
  };
}
