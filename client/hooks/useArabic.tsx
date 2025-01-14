import { useLocale } from "next-intl";
import { useState } from "react";

export default function useArabic() {
  const locale = useLocale();
  const [isArabic] = useState(locale.includes("ar"));
  return {
    isArabic,
  };
}
