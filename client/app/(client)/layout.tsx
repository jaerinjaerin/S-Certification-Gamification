import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  console.info("Render ClientLayout");
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  console.log(locale, getMessages);
  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh border-x-4 border-slate-900" lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
