import { ApiResponse, QuizLogResponse } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";

export async function fetchQuizStageLog(
  quizSetId: string,
  quizStageIndex: number
): Promise<ApiResponse<QuizLogResponse>> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/logs/quizzes/stages?quizset_id=${quizSetId}&quizstage_index=${quizStageIndex}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      console.warn(
        `⚠️ 데이터 없음 fetchQuizLog: ${quizSetId}, ${quizStageIndex}, ${url}`
      );
      return {
        item: null,
        success: false,
        message: "퀴즈 세트 데이터를 찾을 수 없습니다.",
        status: response.status,
      };
    }

    const data = (await response.json()) as ApiResponse<QuizLogResponse>;

    return data;
  } catch (error) {
    console.error(`fetchQuizStageLog error: ${error}`);
    Sentry.captureException(error);

    return {
      item: null,
      success: false,
      message: "퀴즈 로그 데이터를 가져오는 중 오류가 발생했습니다.",
    };
  }
}
