"use server";

import { fetchSupportedLanguageCodes } from "@/services/api/fetchSupportedLanguageCodes";
import { headers } from "next/headers";
import { defaultLocale } from "./config";

// langCode를 매칭하는 함수
export async function mapBrowserLanguageToLocale(searchLanguageCode: string) {
  // languages.json 배열
  const supportedLanguagesCodes = await fetchSupportedLanguageCodes();

  // languages.json에 searchLanguageCode가 있다면 리턴
  if (supportedLanguagesCodes.includes(searchLanguageCode)) {
    return searchLanguageCode;
  }

  // es 예외처리
  if (searchLanguageCode === "es-ES") {
    return "es";
  } else if (searchLanguageCode.includes("es")) {
    return "es-419";
  }

  const [languageCode] = searchLanguageCode.split("-"); // es-HN(es,HN), ko(ko, undefined)

  if (supportedLanguagesCodes.includes(languageCode)) {
    return languageCode;
  }

  return defaultLocale;
}

// 🟢 S3 {languageCode}.json의 languageCode를 리턴하는 함수
export async function getServiceLanguageCode() {
  const browswerLanguageCode = await getBrowserLanguageCode(); // es, es-419, es-MX, es-AR, es-HN ...
  console.log("browswerLanguageCode:", browswerLanguageCode);
  // 브라우저의 언어코드가 없으면 기본 언어코드를 리턴
  if (!browswerLanguageCode) {
    return defaultLocale;
  }

  // 브라우저에서 리턴한 언어코드 - S3 파일 언어코드와 매칭시키는 함수
  const result = await mapBrowserLanguageToLocale(browswerLanguageCode);
  return result;
}

// 🟢 브라우저의 accept-language를 리턴하는 함수
async function getBrowserLanguageCode() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  if (!acceptLanguage) return defaultLocale;
  return acceptLanguage.split(",")[0];
}
