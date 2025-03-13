import { getBrowserLocale, getServiceLangCode } from "@/i18n/locale";
import { NextIntlClientProvider } from "next-intl";

export default async function GuestLayout({
  children,
  params: { campaign_name },
}: {
  children: React.ReactNode;
  params: { campaign_name: string };
}) {
  const timeZone = "Seoul/Asia";
  // const locale = await getLocale();
  // const messages = await getMessages();
  const locale = await getBrowserLocale();
  const serviceLangCode = await getServiceLangCode();

  // console.log("GuestLayout locale", locale);
  const url = `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/${campaign_name}/messages/${serviceLangCode}.json`;
  const messages = await fetch(url, { cache: "force-cache" })
    .then((res) => res.json())
    .catch((error) => console.error("get message error", error));

  return (
    <div lang={locale}>
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={messages}
        locale={locale}
      >
        {/* <AuthProvider>{children}</AuthProvider> */}
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
