import { defaultLanguages } from "@/core/config/default";
import * as Sentry from "@sentry/nextjs";

let cachedLanguages: string[] | null = null;
let lastFetchLangTime: number | null = null;
const CACHE_DURATION = 60000; // 60초 (1분) 캐싱

export async function fetchSupportedLanguageCodes(): Promise<string[]> {
  const now = Date.now();

  // ✅ 캐시된 데이터가 있고, 캐시 만료 시간이 지나지 않았으면 반환
  if (
    cachedLanguages &&
    lastFetchLangTime &&
    now - lastFetchLangTime < CACHE_DURATION
  ) {
    // console.info(`✅ 캐시된 (언어셋) 데이터 반환`);
    return cachedLanguages;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/languages`,
      {
        cache: "no-store", // 항상 새로운 데이터를 가져옴
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error. status: ${response.status}`);
    }

    const result = await response.json();
    if (!result || !result.items) {
      throw new Error("No data returned from /api/languages");
    }

    // ✅ 성공하면 캐싱
    cachedLanguages = result.items.map((item) => item.code);
    lastFetchLangTime = now;

    // console.info(`🔄 캐시 (언어셋) 업데이트`);

    return cachedLanguages!;
  } catch (error) {
    console.error("Failed to fetch supported languages:", error);
    Sentry.captureException(error);

    // ✅ 실패 시 기본 언어 반환 (캐싱하지 않음)
    return defaultLanguages.map((code) => code.code);
  }
}
