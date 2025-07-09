export const dynamic = "force-dynamic";

import { getQuizSets } from "@/app/actions/quiz-actions";
import { mapBrowserLanguageToLocale } from "@/i18n/locale";
import { ApiListResponseV2 } from "@/types/apiTypes";
import { QuizSetPageBaseProps } from "@/types/pages/types";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { AuthType, QuizSet } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { redirect } from "next/navigation";

type SumtotalUserLayoutProps = {
  children: React.ReactNode;
} & QuizSetPageBaseProps;

export default async function SumtotalUserLayout({ children, params: { campaign_name, quizset_path } }: SumtotalUserLayoutProps) {
  if (campaign_name.toLocaleLowerCase() !== "s25") {
    const quizResponse: ApiListResponseV2<QuizSet> = await getQuizSets(quizset_path, campaign_name, AuthType.SUMTOTAL);

    if (quizResponse.status !== 200 || quizResponse.result?.items?.length === 0) {
      console.error("Quiz set not found", campaign_name, quizset_path);
      Sentry.captureMessage(`Quiz set not found: ${campaign_name}, ${quizset_path}`);
      redirect(`/${campaign_name}/not-ready`);
    }
  }

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
  console.warn("campaign_name", campaign_name, "locale", locale);
  const translatedMessages = await fetchContent(URL_FOR_TRANSLATED_JSON);
  console.warn("translatedMessages", translatedMessages["be_a_galaxy_ai_expert"]);

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
    const response = await fetch(url, { cache: "no-cache" });
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
