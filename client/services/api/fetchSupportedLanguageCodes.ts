import { defaultLanguages } from "@/core/config/default";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/prisma-client";

// let cachedLanguages: string[] | null = null;
// let lastFetchLangTime: number | null = null;
// const LANG_CACHE_DURATION = 60000; // 60초 (1분) 캐싱

export async function fetchSupportedLanguageCodes(
  campaignSlug: string,
): Promise<string[]> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: {
        slug: campaignSlug,
      },
      include: {
        domainWebLanguages: {
          include: {
            language: true, // language 정보 포함하여 가져옴
          },
        },
      },
    });

    if (!campaign || !campaign.domainWebLanguages) {
      throw new Error(
        `No campaign or domainWebLanguages found for slug ${campaignSlug}`,
      );
    }
    const languageCodes = campaign.domainWebLanguages
      .map((dwl) => dwl.language.code) // language의 code를 추출
      .filter((code) => code) // 유효한 코드값만 필터링
      .sort();

    return languageCodes;
  } catch (error) {
    console.error("Failed to fetch supported languages:", error);
    Sentry.captureException(error);

    // ✅ 실패 시 기본 언어 반환 (캐싱하지 않음)
    return defaultLanguages
      .filter((item) => !item.name.includes("deprecated"))
      .map((item) => item.code);
  }
}
