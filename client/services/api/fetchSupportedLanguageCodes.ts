import { defaultLanguages } from "@/core/config/default";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/prisma-client";

// let cachedLanguages: string[] | null = null;
// let lastFetchLangTime: number | null = null;
// const LANG_CACHE_DURATION = 60000; // 60초 (1분) 캐싱

export async function fetchSupportedLanguageCodes(): Promise<string[]> {
  try {
    const languages = await prisma.language.findMany();

    return languages
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
