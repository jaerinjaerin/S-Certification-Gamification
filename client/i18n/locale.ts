"use server";
import { defaultLocale } from "@/i18n/config";
import { headers } from "next/headers";

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

const searchLangCodeInSupportedLanguagesCode = async (
  searchLangCode: string
): Promise<string | undefined> => {
  const supportedLanguagesCode = await fetchSupportedLanguages();

  return supportedLanguagesCode.find((lang: string) => {
    if (searchLangCode === "es") return lang === "es-ES";
    if (searchLangCode === "en") return lang === "en-US";
    return lang.includes(searchLangCode);
  });
};

// langCode를 매칭하는 함수
async function mapBrowserLanguageToLocale(browswerLanguage: string) {
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

  const matchingLanguageCode = await searchLangCodeInSupportedLanguagesCode(
    languageCode
  );

  if (matchingLanguageCode) return matchingLanguageCode;

  return defaultLocale;
}

// 번역 json을 가져오기 위해 코드를 반환하는 함수
export async function getServiceLangCode() {
  const browswerLanguage = await getBrowserLanguage();

  if (!browswerLanguage) {
    return defaultLocale;
  }

  const matchingLanguageCode = await searchLangCodeInSupportedLanguagesCode(
    browswerLanguage
  );

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
  return [
    { code: "ar-AE", name: "Language for AR AE" },
    { code: "az", name: "Language for AZ" },
    { code: "bg", name: "Language for BG" },
    { code: "bn", name: "Language for BN" },
    { code: "bs", name: "Language for BS" },
    { code: "cs", name: "Language for CS" },
    { code: "da", name: "Language for DA" },
    { code: "de-DE", name: "Language for DE DE" },
    { code: "el", name: "Language for EL" },
    { code: "en-GB", name: "Language for EN GB" },
    { code: "en-US", name: "Language for EN US" },
    { code: "es-LTN", name: "Language for ES 419" },
    { code: "es-ES", name: "Language for ES ES" },
    { code: "et", name: "Language for ET" },
    { code: "fi", name: "Language for FI" },
    { code: "fr-CA", name: "Language for FR CA" },
    { code: "fr-FR", name: "Language for FR FR" },
    { code: "he", name: "Language for HE" },
    { code: "hr-HR", name: "Language for HR HR" },
    { code: "hu", name: "Language for HU" },
    { code: "id", name: "Language for ID" },
    { code: "it-IT", name: "Language for IT IT" },
    { code: "ja", name: "Language for JA" },
    { code: "ka", name: "Language for KA" },
    { code: "km", name: "Language for KM" },
    { code: "lo", name: "Language for LO" },
    { code: "lt", name: "Language for LT" },
    { code: "mk", name: "Language for MK" },
    { code: "my", name: "Language for MY" },
    { code: "nb", name: "Language for NB" },
    { code: "pl", name: "Language for PL" },
    { code: "pt-BR", name: "Language for PT BR" },
    { code: "pt-PT", name: "Language for PT PT" },
    { code: "ro", name: "Language for RO" },
    { code: "ru", name: "Language for RU" },
    { code: "sk-SK", name: "Language for SK SK" },
    { code: "sl", name: "Language for SL" },
    { code: "sq", name: "Language for SQ" },
    { code: "sr-Cyrl", name: "Language for SR CYRL" },
    { code: "sv", name: "Language for SV" },
    { code: "th", name: "Language for TH" },
    { code: "tr", name: "Language for TR" },
    { code: "uz", name: "Language for UZ" },
    { code: "vi", name: "Language for VI" },
    { code: "zh-CN", name: "Language for ZH CN" },
    { code: "zh-TW", name: "Language for ZH TW" },
    { code: "zh-HK", name: "Language for ZH HK" },
    { code: "lv", name: "Language for Latvia lv" },
    { code: "ko", name: "Language for KR" },
    { code: "en-US-my", name: "Language for Malaysia" },
    { code: "en-US-au", name: "Language for Australia" },
    { code: "fr-FR-cm", name: "Language for Cameroon" },
    { code: "fr-FR-ci", name: "Language for Ivory Coast" },
    { code: "fr-FR-dz", name: "Language for Algeria" },
    { code: "es-LTN-co", name: "Language for Colombia" },
    { code: "fr-FR-fr", name: "Language for France" },
    { code: "es-LTN-mx", name: "Language for Mexico" },
    { code: "fr-FR-ma", name: "Language for Morocco" },
    { code: "es-LTN-pr", name: "Language for Peru" },
    { code: "fr-FR-sn", name: "Language for Senegal" },
    { code: "fr-FR-ch", name: "Language for Switzerland" },
    { code: "fr-FR-TN", name: "Language for Tunisia" },
    { code: "uk", name: "Ukraine" },
  ].map((code) => code.code);

  // try {
  //   const response = await fetch(
  //     `${process.env.NEXT_PUBLIC_API_URL}/api/languages`,
  //     {
  //       cache: "no-cache",
  //     }
  //   );
  //   if (!response.ok) {
  //     throw new Error(`HTTP error. status: ${response.status}`);
  //   }

  //   const result = await response.json();
  //   if (!result) {
  //     return defaultLanguages.map((code) => code.code);
  //   }

  //   return result.items.map((item) => item.code);
  // } catch (error) {
  //   console.error("Failed to fetch supported languages:", error);
  //   Sentry.captureException(error);
  // }
}
