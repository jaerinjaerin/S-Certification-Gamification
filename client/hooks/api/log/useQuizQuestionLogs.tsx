import { apiClient } from "@/services/apiClient";
import { QuizQuestionLogsResponse } from "@/types/apiTypes";
import { UserQuizQuestionLog } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export const useQuizQuestionLogs = (
  userId: string,
  quizSetId: string,
  quizStageIndex: number
) => {
  const [data, setData] = useState<UserQuizQuestionLog[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/questions?quizset_id=${quizSetId}&stage_index=${quizStageIndex}&user_id=${userId}`;
        const response = await apiClient.get<QuizQuestionLogsResponse>(url);

        setData(response.items || null);
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
