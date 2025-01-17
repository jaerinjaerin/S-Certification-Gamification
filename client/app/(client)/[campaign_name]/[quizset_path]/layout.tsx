import { defaultLocale } from "@/i18n/config";
import { fetchSupportedLanguages } from "@/i18n/locale";
import AuthProvider from "@/providers/authProvider";
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
  const getValidLocale = async () => {
    const quizsetPathLocale = quizset_path.split("_").at(-1);
    const supportedLanguagesCode = await fetchSupportedLanguages();

    if (supportedLanguagesCode.find((lang) => lang === quizsetPathLocale))
      return quizsetPathLocale;

    return defaultLocale;
  };
  const locale = await getValidLocale();

  const messages = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/messages/${locale}.json`
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
