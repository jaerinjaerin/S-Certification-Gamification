import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const timeZone = "Seoul/Asia";

  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <div lang={locale}>
      <NextIntlClientProvider timeZone={timeZone} messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
