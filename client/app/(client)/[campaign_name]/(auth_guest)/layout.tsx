import { getBrowserLocale, getServiceLangCode } from "@/i18n/locale";
import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const timeZone = "Seoul/Asia";
  // const locale = await getLocale();
  // const messages = await getMessages();
  const locale = await getBrowserLocale();
  const serviceLangCode = await getServiceLangCode();

  // console.log("GuestLayout locale", locale);

  const messages = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/messages/${serviceLangCode}.json`
  )
    .then((res) => res.json())
    .catch((error) => console.error("get message error", error));

  return (
    <div lang={locale}>
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
