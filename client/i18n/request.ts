import { getUserLocale } from "@/i18n/locale";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();
  const messages = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s24/messages/${locale}.json`
  ).then((res) => res.json());

  return {
    locale,
    messages: messages,
    now: new Date(),
  };
});
