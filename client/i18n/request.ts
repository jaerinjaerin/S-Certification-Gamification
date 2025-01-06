import { getUserLocale } from "@/app/services/locale";
import { getRequestConfig } from "next-intl/server";

// export default getRequestConfig(async ({ requestLocale }) => {
//   // Read from potential `[locale]` segment
//   let locale = await requestLocale;
//   console.log("locale은 뭔가요?", locale);

//   if (!locale) {
//     // The user is logged in
//     locale = await getUserLocale();
//     console.log("여기서 ocale은요?", locale);
//     console.log(routing.pathnames);
//   }

//   // // Ensure that the incoming locale is valid
//   // if (!locales.includes(locale as any)) {
//   //   locale = defaultLocale;
//   // }

//   if (!locale || !routing.locales.includes(locale as any)) {
//     locale = routing.defaultLocale;
//   }

//   return {
//     locale,
//     messages: (await import(`../messages/${locale}.json`)).default,
//   };
// });

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    now: new Date(),
  };
});
