import { mapBrowserLanguageToLocale } from "@/i18n/locale";
import { PolicyProvider } from "@/providers/policyProvider";
import { extractCodesFromPath } from "@/utils/pathUtils";
import * as Sentry from "@sentry/nextjs";
import { NextIntlClientProvider } from "next-intl";

export default async function SumtotalUserLayout({
  children,
  params: { campaign_name, quizset_path },
}: {
  children: React.ReactNode;
  params: { campaign_name: string; quizset_path: string };
}) {
  const timeZone = "Seoul/Asia";
  const { domainCode, languageCode } = extractCodesFromPath(quizset_path);

  // 패턴에 맞는 형식으로 languageCode 변환 (fr-FR-TN -> fr-FR)
  const normalizedLanguageCode = languageCode.replace(
    /^([A-Za-z]{2}-[A-Za-z]{2})-([a-zA-Z]{2})$/,
    "$1"
  );

  const locale = await mapBrowserLanguageToLocale(normalizedLanguageCode);
  console.log("QuizSetLayout locale:", locale);

  const privacyContent = await fetchPrivacyContent(domainCode);
  const termContent = await fetchTermContent(domainCode);

  const URL_FOR_TRANSLATED_JSON = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${campaign_name}/messages/${locale}.json`;
  const translatedMessages = await fetchContent(URL_FOR_TRANSLATED_JSON);
  const domainInformation = await fetchInformationAboutDomain(domainCode);
  const agreementContent = await fetchAgreementContent(domainCode);

  return (
    <div>
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={translatedMessages}
        locale={locale}
      >
        <PolicyProvider
          privacyContent={privacyContent?.contents}
          termContent={termContent?.contents}
          agreementContent={agreementContent && agreementContent?.contents}
          domainName={domainInformation?.name}
          subsidiary={domainInformation?.subsidiary}
        >
          {children}
        </PolicyProvider>
      </NextIntlClientProvider>
    </div>
  );
}

async function fetchInformationAboutDomain(domainCode: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/domains?domain_code=${domainCode}`,
      {
        cache: "force-cache",
      }
    );
    if (!response.ok) {
      throw new Error(
        `fetch information about domain error: ${response.status}`
      );
    }

    const result = await response.json();
    if (!result) {
      throw new Error(
        `fetchError: information about domain response.json() error`
      );
    }

    return result.items[0];
  } catch (error) {
    Sentry.captureException(error, (scope) => {
      scope.setContext("operation", {
        type: "http_request",
        endpoint: "/api/domains?domain_code",
        method: "POST",
        description: "Failed to fetch information about domain",
      });
      scope.setTag("domainCode", domainCode);
      return scope;
    });
  }
}

async function fetchAgreementContent(domainCode: string) {
  if (domainCode !== "NAT_2410") {
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/agreement/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchPrivacyContent(domainCode: string) {
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/privacy/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchTermContent(domainCode: string) {
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/jsons/term/${domainCode}.json`;
  return await fetchContent(url);
}

async function fetchContent(url: string) {
  try {
    const response = await fetch(url, { cache: "force-cache" });
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
