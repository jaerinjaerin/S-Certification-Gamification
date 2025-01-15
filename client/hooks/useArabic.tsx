import { useLocale } from "next-intl";

export default function useArabic() {
  const locale = useLocale();
  const isArabic = locale.includes("ar");
  return {
    isArabic,
  };
}
