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
];

export async function getUserLocale() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language")?.split(",")[0];
  console.log(headersList.get("accept-language"));

  return acceptLanguage;
}

export async function getUserLangCode() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language")?.split(",")[0];

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/languages`
  ); // ㅇ{외처리

  const result = await response.json();
  const supportedLanguagesCode = result.items.map((item) => item.code);

  // acceptLanguage가 없으면 default return
  if (!acceptLanguage) {
    return defaultLocale;
  }

  // 브라우저 언어코드와 우리 언어코드가 1:1 매핑이 되면 바로 사용
  const hasLanguagecode = supportedLanguagesCode.find((lang) =>
    lang.includes(acceptLanguage)
  );

  if (hasLanguagecode) {
    return hasLanguagecode;
  }

  // [언어코드, 국가코드]
  const [languageCode, countryCode] = acceptLanguage.split("-"); // es-ES

  switch (languageCode) {
    case "en":
      // 언어코드가 "en"이면
      if (acceptLanguage === "en-GB") {
        return "en-GB";
      } else if (acceptLanguage.startsWith("en")) {
        return "en-US";
      }
      break;

    case "fr":
      // 언어코드가 "fr"이면
      if (acceptLanguage === "fr-CA") {
        return "fr-CA";
      } else if (acceptLanguage.startsWith("fr")) {
        return "fr-FR";
      }
      break;

    case "es":
      // 언어코드가 "es"이면
      // accpetLanguage가 "es-419"이거나 국가코드가 LTN에 속해있으면 es-LTN es-419
      if (
        usedLTNLanguages.includes(countryCode) ||
        acceptLanguage === "es-419"
      ) {
        return "es-LTN";
      } else {
        return "es-ES";
      }

    default:
      return defaultLocale;
  }

  return defaultLocale;
}
