"use server";
import { defaultLocale } from "@/i18n/config";
import { defaultLanguages } from "@/core/config/default";
import { headers } from "next/headers";
import * as Sentry from "@sentry/nextjs";

// ltn을 사용하는 국가
const usedLTNLanguages = [
  "MX",
  "CO",
  "AR",
  "PY",
  "UY",
  "PA",
  "EC",
  "CR",
  "DR",
  "GT",
  "HN",
  "NI",
  "SV",
  "CL",
  "BO",
  "PE",
  "VE",
  "KE",
];
const supportedLanguagesCode = await fetchSupportedLanguages();

const searchLangCodeInSupportedLanguagesCode = (
  searchLangCode: string
): string | undefined => {
  return supportedLanguagesCode.find((lang: string) => {
    if (searchLangCode === "es") return lang === "es-ES";
    return lang.includes(searchLangCode);
  });
};

// langCode를 매칭하는 함수
function mapBrowserLanguageToLocale(browswerLanguage: string) {
  const [languageCode, countryCode] = browswerLanguage.split("-");

  if (languageCode === "en") {
    if (countryCode === "GB") return "en-GB";
    return "en-US";
  }

  if (languageCode === "fr") {
    if (countryCode === "CA") return "fr-CA";
    return "fr-FR";
  }

  if (languageCode === "es") {
    if (
      countryCode === "419" ||
      (countryCode && usedLTNLanguages.includes(countryCode))
    ) {
      return "es-LTN";
    }
    return "es-ES";
  }

  const matchingLanguageCode =
    searchLangCodeInSupportedLanguagesCode(languageCode);

  if (matchingLanguageCode) return matchingLanguageCode;

  return defaultLocale;
}

// 번역 json을 가져오기 위해 코드를 반환하는 함수
export async function getServiceLangCode() {
  const browswerLanguage = await getBrowserLanguage();

  if (!browswerLanguage) {
    return defaultLocale;
  }

  const matchingLanguageCode =
    searchLangCodeInSupportedLanguagesCode(browswerLanguage);

  if (matchingLanguageCode) {
    return matchingLanguageCode;
  }

  return mapBrowserLanguageToLocale(browswerLanguage);
}

export async function getBrowserLocale() {
  const serviceLangCode = await getServiceLangCode();
  if (serviceLangCode === "es-LTN") return "es-419";
  return serviceLangCode;
}

// 브라우저의 accept-language를 리턴하는 함수
async function getBrowserLanguage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  if (!acceptLanguage) return defaultLocale;
  return acceptLanguage.split(",")[0];
}

// /api/languages의 데이터를 리턴하는 함수
export async function fetchSupportedLanguages() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/languages`
    );
    if (!response.ok) {
      throw new Error(`HTTP error. status: ${response.status}`);
    }

    const result = await response.json();
    if (!result) {
      return defaultLanguages.map((code) => code.code);
    }

    return result.items.map((item) => item.code);
  } catch (error) {
    console.error("Failed to fetch supported languages:", error);
    Sentry.captureException(error);
  }
}
