import { apiClient } from "@/services/apiClient";
import { QuizStageLogResponse } from "@/types/apiTypes";
import { UserQuizStageLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export const useQuizStageLog = (
  userId: string,
  quizSetId: string,
  quizStageIndex: number
) => {
  const [data, setData] = useState<UserQuizStageLog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/stages?quizset_id=${quizSetId}&quizstage_index=${quizStageIndex}`;
        const response = await apiClient.get<QuizStageLogResponse>(
          url,
          "force-cache"
        );

        setData(response.item || null);
      } catch (err) {
        setError("Failed to fetch quiz question logs");
        Sentry.captureMessage("Quiz path validation error", (scope) => {
          scope.setContext("operation", {
            type: "validation",
            description: "Validation error",
          });
          scope.setTag("quizSetId", quizSetId);
          scope.setTag("quizStageIndex", quizStageIndex);
          return scope;
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizSetId, quizStageIndex]);

  return { data, loading, error };
};
