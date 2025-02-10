import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";

let cachedQuizSets: Record<string, ApiResponse<QuizSetEx>> = {};
let lastFetchQuizSetTime: Record<string, number> = {};
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
    lastFetchQuizSetTime[cacheKey] &&
    now - lastFetchQuizSetTime[cacheKey] < CACHE_DURATION
  ) {
    console.info(`✅ 캐시된 (퀴즈셋) 데이터 반환: ${cacheKey}`);
    return cachedQuizSets[cacheKey];
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${quizsetPath}?user_id=${userId}`;
    const response = await fetch(url, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      console.log(`⚠️ 데이터 없음: ${quizsetPath}`);
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

    // ✅ API 요청 성공 시 로컬 캐시에 저장
    cachedQuizSets[cacheKey] = data;
    lastFetchQuizSetTime[cacheKey] = now;

    console.info(`🔄 캐시 (퀴즈셋) 업데이트: ${cacheKey}`);

    return {
      item: data.item,
      success: true,
      message: "캠페인 데이터를 성공적으로 가져왔습니다.",
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
