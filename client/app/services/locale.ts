"use server";
import { cookies, headers } from "next/headers";
import { defaultLocale, Locale } from "@/i18n/config";
import Languages from "@/public/assets/seeds/languages.json";

// const supportedLanguagesCode = [
//   "en-US",
//   "fr-CA",
//   "fr-FR",
//   "it-IT",
//   "es-ES",
//   "pt-PT",
//   "pl",
//   "de-DE",
//   "bg",
//   "ro",
//   "cs",
//   "sk-SK",
//   "sq",
//   "bs",
//   "hr-HR",
//   "mk",
//   "sr-Cyrl",
//   "sl",
//   "hu",
//   "et",
//   "lv",
//   "lt",
//   "el",
//   "sv",
//   "fi",
//   "nb",
//   "da",
//   "en-GB",
//   "nl",
//   "lb",
//   "ru",
//   "az",
//   "ka",
//   "kk",
//   "ky",
//   "tg",
//   "uz",
//   "zh-CN",
//   "zh-TW",
//   "id",
//   "th",
//   "km",
//   "lo",
//   "my",
//   "vi",
//   "bn",
//   "es-419",
//   "pt-BR",
//   "ar-AE",
//   "he",
//   "tr",
//   "ja",
// ];

const supportedLanguagesCode = Languages.map((lang) => lang.code);
const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get(COOKIE_NAME)?.value;

  if (localeFromCookie) {
    return localeFromCookie;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language")?.split(",")[0];

  if (!acceptLanguage) {
    return defaultLocale;
  }

  const hasLanguagecode = supportedLanguagesCode.find((lang) =>
    lang.includes(acceptLanguage)
  );

  if (hasLanguagecode) {
    return hasLanguagecode;
  } else {
    const [languageCode] = acceptLanguage.split("-");
    const hasLanguagecode = supportedLanguagesCode.find((lang) => {
      if (!lang.includes(languageCode)) return false;

      switch (true) {
        case acceptLanguage === "en-GB":
          return lang === "en-GB";
        case acceptLanguage.startsWith("en"):
          return lang === "en-US";
        case acceptLanguage === "fr-CA":
          return lang === "fr-CA";
        case acceptLanguage.startsWith("fr"):
          return lang === "fr-FR";
        case acceptLanguage === "es-ES":
          return lang === "es-ES";
        case acceptLanguage.startsWith("es"):
          return lang === "es-419";
        default:
          return lang === languageCode;
      }
    });

    if (hasLanguagecode) return hasLanguagecode;
    return defaultLocale;
  }
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
