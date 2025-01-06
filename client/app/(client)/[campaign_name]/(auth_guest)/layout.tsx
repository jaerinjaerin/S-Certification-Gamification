import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const timeZone = "Seoul/Asia";
  const locale = await getLocale();
  const messages = await getMessages();

  console.log("GuestLayout locale", locale);

  return (
    <div lang={locale}>
      <NextIntlClientProvider timeZone={timeZone} messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
