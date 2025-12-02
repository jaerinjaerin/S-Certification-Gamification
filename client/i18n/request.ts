import { getRequestConfig } from "next-intl/server";
import { defaultLocale } from "./config";

export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: {},
    now: new Date(),
  };
});

// TODO: requestConfig 이렇게 작성해도 되는지 확인 필요
