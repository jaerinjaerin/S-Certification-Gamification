import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";

export default async function SumtotalUserLayout({
  children,
  params: { quizset_path },
}: {
  children: React.ReactNode;
  params: { quizset_path: string };
}) {
  const timeZone = "Seoul/Asia";
  const locale = quizset_path.split("_").at(-1);
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <div lang={locale}>
      <NextIntlClientProvider timeZone={timeZone} messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
