import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";

export async function fetchQuizSet(
  campaignSlug: string,
  quizsetPath: string,
  userId: string
): Promise<ApiResponse<QuizSetEx>> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${quizsetPath}?user_id=${userId}&campaign_slug=${campaignSlug}`;
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      console.warn(`⚠️ 데이터 없음: ${quizsetPath}, ${response}, ${url}`);
      return {
        item: null,
        success: false,
        message: "퀴즈 세트 데이터를 찾을 수 없습니다.",
        status: response.status,
      };
    }

    const data = await response.json();

    if (!data.item) {
      return {
        item: null,
        success: false,
        message: "퀴즈 세트 데이터를 찾을 수 없습니다.",
        status: response.status,
      };
    }

    return {
      item: data.item,
      success: true,
      message: "퀴즈 세트를 성공적으로 가져왔습니다.",
      status: response.status,
    };
  } catch (error) {
    console.error(`fetchQuizSet error: ${error}`);
    Sentry.captureException(error);

    return {
      item: null,
      success: false,
      message: "퀴즈 세트를 가져오는 중 문제가 발생했습니다.",
    };
  }
}
