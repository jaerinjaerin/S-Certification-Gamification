import { defaultLocale } from "@/i18n/config";

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

export function mapBrowserLanguageToLocale(
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
