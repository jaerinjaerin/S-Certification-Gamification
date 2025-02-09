import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";
import { apiClient } from "../apiClient";

let cachedQuizSets: Record<string, ApiResponse<QuizSetEx>> = {};
let lastFetchTime: Record<string, number> = {};
const CACHE_DURATION = 60000; // 60초 캐싱

export async function fetchQuizSet(
  quizsetPath: string,
  userId: string
): Promise<ApiResponse<QuizSetEx>> {
  const cacheKey = `${quizsetPath}_${userId}`;
  const now = Date.now();

  // ✅ 캐시된 데이터가 있고, 60초 이내라면 캐시된 데이터 반환
  if (
    cachedQuizSets[cacheKey] &&
    lastFetchTime[cacheKey] &&
    now - lastFetchTime[cacheKey] < CACHE_DURATION
  ) {
    return cachedQuizSets[cacheKey];
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${quizsetPath}?user_id=${userId}`;
    const response = await apiClient.get<ApiResponse<QuizSetEx>>(url);

    // console.log("fetchQuizSet response", response);

    if (!response.item) {
      return {
        item: null,
        success: false,
        message: "퀴즈 세트 데이터를 찾을 수 없습니다.",
      };
    }

    // ✅ 성공 시 캐싱
    cachedQuizSets[cacheKey] = response;
    lastFetchTime[cacheKey] = now;

    return response;
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
