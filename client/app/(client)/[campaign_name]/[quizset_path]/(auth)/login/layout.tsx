import { mapBrowserLanguageToLocale } from "@/i18n/locale";
import { QuizSetPageBaseProps } from "@/types/pages/types";
import { extractCodesFromPath } from "@/utils/pathUtils";
import * as Sentry from "@sentry/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { redirect } from "next/navigation";

type SumtotalUserLayoutProps = {
  children: React.ReactNode;
} & QuizSetPageBaseProps;

export default async function SumtotalUserLayout({ children, params: { campaign_name, quizset_path } }: SumtotalUserLayoutProps) {
  const timeZone = "Seoul/Asia";
  const codes = extractCodesFromPath(quizset_path);

  if (codes == null) {
    redirect(`/${campaign_name}/not-ready`);
  }

  const { languageCode } = codes;

  // 패턴에 맞는 형식으로 languageCode 변환 (fr-FR-TN -> fr-FR)
  const normalizedLanguageCode = languageCode.replace(/^([A-Za-z]{2}-[A-Za-z]{2})-([a-zA-Z]{2})$/, "$1");
  const locale = await mapBrowserLanguageToLocale(normalizedLanguageCode, campaign_name);
  const URL_FOR_TRANSLATED_JSON = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${campaign_name}/messages/${locale}.json`;
  const translatedMessages = await fetchContent(URL_FOR_TRANSLATED_JSON);

  return (
    <div>
      <NextIntlClientProvider timeZone={timeZone} messages={translatedMessages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}

async function fetchContent(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`fetchError: ${response.status}`);
    }
    const result = await response.json();
    if (!result) {
      throw new Error(`fetchError: response.json() error`);
    }
    return result;
  } catch (error) {
    console.error(`fetchContent error: ${url}, ${error}`);
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "api",
        endpoint: "request/json",
        method: "POST",
        description: "Failed to fetch content",
      });
      scope.setTag("url", url);
      return scope;
    });
  }
}
