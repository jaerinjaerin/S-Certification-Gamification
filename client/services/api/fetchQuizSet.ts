import { ApiResponse, QuizSetEx } from "@/types/apiTypes";
import * as Sentry from "@sentry/nextjs";

// let cachedQuizSets: Record<string, ApiResponse<QuizSetEx>> = {};
// let lastFetchQuizSetTime: Record<string, number> = {};
// let lastCacheCleanupTime = Date.now(); // ✅ 마지막 캐시 정리 시간 기록

// const QUIZ_SET_CACHE_DURATION = 10 * 60 * 1000; // 10분 캐싱
// const QUIZ_SET_CACHE_TTL = 30 * 60 * 1000; // 30분 후 캐시 삭제

export async function fetchQuizSet(
  quizsetPath: string,
  userId: string
): Promise<ApiResponse<QuizSetEx>> {
  const cacheKey = `${quizsetPath}_${userId}`;
  const now = Date.now();

  // // ✅ 마지막 캐시 정리 이후 30분 이상 경과한 경우에만 캐시 삭제 실행
  // console.log(
  //   "now - lastCacheCleanupTime",
  //   now - lastCacheCleanupTime,
  //   now,
  //   lastCacheCleanupTime
  // );
  // if (now - lastCacheCleanupTime > QUIZ_SET_CACHE_TTL) {
  //   let deletedCount = 0;
  //   Object.keys(lastFetchQuizSetTime).forEach((key) => {
  //     if (now - lastFetchQuizSetTime[key] > QUIZ_SET_CACHE_TTL) {
  //       delete cachedQuizSets[key];
  //       delete lastFetchQuizSetTime[key];
  //       deletedCount++;
  //     }
  //   });

  //   if (deletedCount > 0) {
  //     console.warn(`🗑️ 캐시 삭제됨: ${deletedCount}개`);
  //   }

  //   lastCacheCleanupTime = now; // ✅ 마지막 캐시 삭제 시간 갱신
  // }

  // // ✅ 캐시된 데이터가 있고, 60초 이내라면 캐시된 데이터 반환
  // if (
  //   cachedQuizSets[cacheKey] &&
  //   lastFetchQuizSetTime[cacheKey] &&
  //   now - lastFetchQuizSetTime[cacheKey] < QUIZ_SET_CACHE_DURATION
  // ) {
  //   return cachedQuizSets[cacheKey];
  // }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/quizsets/${quizsetPath}?user_id=${userId}`;
    const response = await fetch(url, { method: "GET", cache: "force-cache" });

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

    // // ✅ API 요청 성공 시 캐시에 저장
    // cachedQuizSets[cacheKey] = data;
    // lastFetchQuizSetTime[cacheKey] = now;

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
