"use client";
import { getUserLocale } from "@/i18n/locale";
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface IntlContextType {
  locale: string | null;
  messages: Record<string, any> | null;
  intlLoading: boolean;
  isArabic: boolean;
  translation: (keyString: string) => any;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

export const IntlProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [intlLoading, setIntlLoading] = useState(true);
  const [isArabic, setIsArabic] = useState(false);
  const params = useParams();

  useEffect(() => {
    if (locale) return;

    const fetchLocale = async () => {
      if (params.quizset_path) {
        const quizPath = params.quizset_path as string;
        const locale = quizPath.split("_").at(-1);
        console.log("Extracted locale from path:", locale);

        return locale;
      }

      const locale = await getUserLocale();
      console.log("Fetched user locale:", locale);

      if (!locale) {
        throw new Error("Locale 정보를 가져오는데 문제가 발생했습니다.");
      }

      return locale;
    };

    const fetchMessages = async (locale) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/messages/${locale}.json`
      );

      if (response.ok) {
        const data = await response.json();
        return data; // messages
      } else {
        throw new Error(
          `${locale}에 해당하는 JSON 데이터를 가져오는데 문제가 발생했습니다.`
        );
      }
    };

    const fetchData = async () => {
      setIntlLoading(true);
      try {
        const resolvedLocale = (await fetchLocale()) as string;
        const resolvedMessages = await fetchMessages(resolvedLocale);

        setLocale(resolvedLocale); // locale 상태 설정
        setMessages(resolvedMessages);
        setIsArabic(resolvedLocale === "ar-AE");
      } catch (error) {
        console.error(error);
      } finally {
        setIntlLoading(false);
      }
    };

    fetchData();
  }, [locale, params.quizset_path]);

  const translation = (keyString: string) => {
    if (!messages) return;
    return messages[keyString];
  };

  return (
    <IntlContext.Provider
      value={{
        locale,
        messages,
        intlLoading,
        isArabic,
        translation,
      }}
    >
      {children}
    </IntlContext.Provider>
  );
};

export const useIntl = () => {
  const context = useContext(IntlContext);
  if (context === undefined) {
    throw new Error("useIntl는 IntlProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};
