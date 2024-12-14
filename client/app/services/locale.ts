"use server";

import { defaultLocale } from "@/i18n/config";
import { headers } from "next/headers";
import language from "@/public/assets/seeds/languages.json";

export async function getUserLocale() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language")?.split(",")[0];
  const supportedLanguages = language.map((lang) => lang.code); // 지원하는 언어 리스트

  // 지원하지 않는 언어라면 defaultLocale을 반환
  return acceptLanguage && supportedLanguages.includes(acceptLanguage)
    ? acceptLanguage
    : defaultLocale;
}

// export async function setUserLocale(locale: Locale) {
//   cookies().set(COOKIE_NAME, locale);
// }
