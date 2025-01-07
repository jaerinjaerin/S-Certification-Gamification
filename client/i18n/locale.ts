"use server";
import { headers } from "next/headers";
import { defaultLocale } from "@/i18n/config";
import Languages from "@/public/assets/seeds/languages.json";

const supportedLanguagesCode = Languages.map((lang) => lang.code);

export async function getUserLocale() {
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
