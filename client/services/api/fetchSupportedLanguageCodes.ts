import { defaultLanguages } from "@/core/config/default";
import * as Sentry from "@sentry/nextjs";

// let cachedLanguages: string[] | null = null;
// let lastFetchLangTime: number | null = null;
// const LANG_CACHE_DURATION = 60000; // 60초 (1분) 캐싱

export async function fetchSupportedLanguageCodes(): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/languages`,
      {
        cache: "force-cache", // 항상 새로운 데이터를 가져옴
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ 데이터 없음: 언어코드셋`);
      throw new Error(`HTTP error. status: ${response.status}`);
    }

    const result = await response.json();
    if (!result || !result.items) {
      throw new Error("No data returned from /api/languages");
    }

    return result.items
      .filter((item) => !item.name.includes("deprecated"))
      .map((item) => item.code)
      .sort();
  } catch (error) {
    console.error("Failed to fetch supported languages:", error);
    Sentry.captureException(error);

    // ✅ 실패 시 기본 언어 반환 (캐싱하지 않음)
    return defaultLanguages
      .filter((item) => !item.name.includes("deprecated"))
      .map((item) => item.code);
  }
}
