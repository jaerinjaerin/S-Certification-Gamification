"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { useQuiz } from "@/providers/quiz_provider";
import { Campaign, Country, CountryActivity } from "@prisma/client";
import { useSearchParams } from "next/navigation";

type CountryActivityEx = CountryActivity & {
  campaign: Campaign;
  country: Country;
};

// type QuizSetEx = QuizSet & {
//   translations: QuizSetTranslation[];
//   stages: Stage[];
// };

export default function QuizMap() {
  const searchParams = useSearchParams();

  const activityId = searchParams.get("activityId");
  const userJob = searchParams.get("job");
  const { country, selectedLanguage } = useQuiz();

  console.log("useQuiz", country, selectedLanguage);

  const { isLoading, error, item } = useGetItem<any>(
    `/api/quiz?activity_id=${activityId}&countryId=${country?.id}&job=${userJob}&lang_code=${selectedLanguage?.languageCode}`
  );

  const routeQuiz = () => {
    // window.location.href = "/quiz";
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/quiz${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("item", item);

  return (
    <div>
      <h1>Map</h1>
      {/* {item && (
        <>
          <p>{item?.countryCode}</p>
          <p>{item.campaign.name}</p>
          <p>{item.country.name}</p>
        </>
      )} */}

      <button onClick={routeQuiz}>Go Map</button>
      {error && <div>{error.message}</div>}
    </div>
  );
}
