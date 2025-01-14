import { mapBrowserLanguageToLocale } from "./convertBrowswerLanguageToLocale";

// Mock defaultLocale if necessary
jest.mock("@/i18n/config", () => ({
  defaultLocale: "en-US",
}));

describe("mapBrowserLanguageToLocale", () => {
  it("should return 'es-ES' for languageCode 'es'", () => {
    const result = mapBrowserLanguageToLocale("es");
    expect(result).toBe("es-ES");
  });

  it("should return 'en-US' for languageCode 'en'", () => {
    const result = mapBrowserLanguageToLocale("en");
    expect(result).toBe("en-US");
  });

  it("should return 'en-GB' for languageCode 'en' and countryCode 'GB'", () => {
    const result = mapBrowserLanguageToLocale("en", "GB");
    expect(result).toBe("en-GB");
  });

  it("should return 'es-LTN' for languageCode 'es' and countryCode '419'", () => {
    const result = mapBrowserLanguageToLocale("es", "419");
    expect(result).toBe("es-LTN");
  });

  it("should return 'es-LTN' for languageCode 'es' and a countryCode in usedLTNLanguages", () => {
    const result = mapBrowserLanguageToLocale("es", "MX");
    expect(result).toBe("es-LTN");
  });

  it("should return defaultLocale for unsupported languageCode and countryCode", () => {
    const result = mapBrowserLanguageToLocale("de", "DE");
    expect(result).toBe("en-US"); // defaultLocale
  });
});
