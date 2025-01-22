import AuthProvider from "@/providers/authProvider";
import { PolicyProvider } from "@/providers/policyProvider";
import { extractCodesFromPath } from "@/utils/pathUtils";
import * as Sentry from "@sentry/nextjs";
import { NextIntlClientProvider } from "next-intl";

export default async function SumtotalUserLayout({
  children,
  params: { quizset_path },
}: {
  children: React.ReactNode;
  params: { quizset_path: string };
}) {
  console.log("SumtotalUserLayout quizset_path", quizset_path);
  const timeZone = "Seoul/Asia";
  const locale = quizset_path.split("_").at(-1);

  const { domainCode } = extractCodesFromPath(quizset_path);
  const privacyContent = await fetchPrivacyContent(domainCode);
  const termContent = await fetchTermContent(domainCode);

  const URL_FOR_TRANSLATED_JSON = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/messages/${locale}.json`;
  const translatedMessages = await fetchContent(URL_FOR_TRANSLATED_JSON);
  const { name } = await fetchInformationAboutDomain(domainCode);

  return (
    <div>
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={translatedMessages}
        locale={locale}
      >
        <AuthProvider>
          <PolicyProvider
            privacyContent={privacyContent?.contents}
            termContent={termContent?.contents}
            domainName={name}
          >
            {children}
          </PolicyProvider>
        </AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}

async function fetchInformationAboutDomain(domainCode: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/domains?domain_code=${domainCode}`
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
    Sentry.captureException(error);
  }
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
    Sentry.captureException(error);
  }
}
