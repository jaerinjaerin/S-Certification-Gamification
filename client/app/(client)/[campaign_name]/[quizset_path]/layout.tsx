import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";

export default async function SumtotalUserLayout({
  children,
  params: { quizset_path },
}: {
  children: React.ReactNode;
  params: { quizset_path: string };
}) {
  // const { validatedPath, isValid, wasCorrected } =
  //   await validateAndCorrectQuizSetPath(quizset_path, defaultLanguageCode);

  // if (!isValid) {
  //   console.error("Path validation failed.");
  //   redirect("/error");
  // } else if (wasCorrected) {
  //   console.log(`Path was corrected to: ${validatedPath}`);
  //   redirect(`/${campaign_name}/${validatedPath}`);
  // } else {
  //   console.log("Path is valid.");
  // }

  // console.log("SumtotalUserLayout quizset_path", quizset_path);
  const timeZone = "Seoul/Asia";
  const locale = quizset_path.split("_").at(-1);

  const messages = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/messages/${locale}.json`
  )
    .then((res) => res.json())
    .catch((error) =>
      console.error("SumtotalUserLayout get message error", error)
    );

  return (
    <div>
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={messages}
        locale={locale}
      >
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}

interface ValidationResult {
  validatedPath: string; // 수정된 또는 원래의 `quizSetPath`
  isValid: boolean; // 검증이 성공했는지 여부
  wasCorrected: boolean; // 수정이 이루어졌는지 여부
}

const validateAndCorrectQuizSetPath = async (
  quizSetPath,
  defaultLanguageCode
): Promise<ValidationResult> => {
  try {
    const { domainCode, languageCode } = extractCodesFromPath(quizSetPath);

    // 도메인 검증
    const domainsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/domains`,
      {
        method: "GET",
        // cache: "force-cache",
      }
    );

    if (!domainsResponse.ok) {
      throw new Error(`Failed to fetch domains: ${domainsResponse.status}`);
    }

    const domainsData = await domainsResponse.json();
    // // console.log("Domains response:", domainsData);

    const isDomainValid = domainsData.items?.some(
      (domain) => domain.code === domainCode
    );

    if (!isDomainValid) {
      console.error(`Invalid domain code: ${domainCode}`);
      return {
        validatedPath: quizSetPath,
        isValid: false,
        wasCorrected: false,
      };
    }

    // 언어 검증
    const languagesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/languages`,
      {
        method: "GET",
        cache: "force-cache",
      }
    );

    if (!languagesResponse.ok) {
      throw new Error(`Failed to fetch languages: ${languagesResponse.status}`);
    }

    const languagesData = await languagesResponse.json();
    // // console.log("Languages response:", languagesData);

    const isLanguageValid = languagesData.items?.some(
      (language) => language.code === languageCode
    );

    if (!isLanguageValid) {
      // languageCode를 기본값으로 수정
      console.warn(
        `Invalid language code: ${languageCode}. Defaulting to ${defaultLanguageCode}`
      );
      const updatedPath = quizSetPath.replace(
        `${languageCode}`,
        `${defaultLanguageCode}`
      );

      return {
        validatedPath: updatedPath,
        isValid: true,
        wasCorrected: true,
      };
    }

    // 모든 검증 통과
    return {
      validatedPath: quizSetPath,
      isValid: true,
      wasCorrected: false,
    };
  } catch (error) {
    console.error(`Failed to validate quizSetPath: ${error}`);
    Sentry.captureMessage("Quiz path validation error", (scope) => {
      scope.setContext("operation", {
        type: "validation",
        description: "Validation error",
      });
      scope.setTag("quizSetPath", quizSetPath);
      return scope;
    });

    return {
      validatedPath: quizSetPath,
      isValid: false,
      wasCorrected: false,
    };
  }
};
