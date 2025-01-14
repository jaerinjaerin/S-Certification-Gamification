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
];

export async function getBrowserLocale() {
  const browserLocale = await getBrowserLanguage();

  return browserLocale;
}

export async function getServiceLangCode() {
  const browswerLanguage = await getBrowserLanguage();
  if (!browswerLanguage) {
    return defaultLocale;
  }

  const supportedLanguagesCode = await fetchSupportedLanguages();
  const matchingLanguageCode = supportedLanguagesCode.find((lang) =>
    lang.includes(browswerLanguage)
  );

  if (matchingLanguageCode) {
    return matchingLanguageCode;
  }

  const [languageCode, countryCode] = browswerLanguage.split("-");
  return mapBrowserLanguageToLocale(languageCode, countryCode);
}

async function getBrowserLanguage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  if (!acceptLanguage) return defaultLocale;
  return acceptLanguage.split(",")[0];
}

async function fetchSupportedLanguages() {
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

function mapBrowserLanguageToLocale(
  languageCode: string,
  countryCode?: string
) {
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

  return defaultLocale;
}
