import { useLocale } from "next-intl";

export default function useCheckLocale() {
  const locale = useLocale();
  const isArabic = locale.includes("ar") || locale.includes("he");
  const isMyanmar = locale === "my";

  return {
    isArabic,
    isMyanmar,
  };
}
