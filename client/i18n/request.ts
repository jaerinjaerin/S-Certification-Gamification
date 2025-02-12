import { getBrowserLocale, getServiceLangCode } from "@/i18n/locale";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = await getBrowserLocale();
  const lang = await getServiceLangCode();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/messages/${lang}.json`,
    { cache: "force-cache" }
  );

  if (response.ok) {
    const messages = await response.json();
    return {
      locale,
      messages: messages,
      now: new Date(),
    };
  } else {
    // const data = await response.json();
    // console.log("DATA", data);
    throw new Error(
      `${locale}에 해당하는 JSON 데이터를 가져오는데 문제가 발생했습니다.`
    );
  }
});
