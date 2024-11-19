"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { useQuiz } from "@/providers/quiz_provider";
import {
  Campaign,
  CampaignDomainQuizSet,
  Domain,
  Language,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

// type CountryEx = Country & {
//   languages: CountryLanguage[];
// };

type CampaignDomainQuizSetEx = CampaignDomainQuizSet & {
  campaign: Campaign;
  domain: Domain;
  language: Language;
};

export default function QuizMap() {
  const searchParams = useSearchParams();

  const quizsetId = searchParams.get("quizset_id");

  if (!quizsetId) {
    return <div>Invalid quiz set ID</div>;
  }
  // const userJob = searchParams.get("job");

  const {
    campaign,
    country,
    setCampaign,
    setCountry,
    languages,
    setLanguages,
    selectedLanguage,
    setSelectedLanguage,
  } = useQuiz();

  const { data: session } = useSession();

  // console.log("useQuiz", campaign, country, languages, selectedLanguage);

  const { isLoading, error, item } = useGetItem<CampaignDomainQuizSetEx>(
    `/api/campaign/quiz_set/${quizsetId}`
  );

  console.log("item", item);

  // const handleSelect = (countryLanguage: CountryLanguage) => {
  //   setSelectedLanguage(countryLanguage);
  // };

  // useEffect(() => {
  //   if (campaignActivity?.campaign) {
  //     setCampaign(campaignActivity?.campaign);
  //   }
  //   if (campaignActivity?.country) {
  //     setCountry(campaignActivity?.country);
  //   }
  //   if (campaignActivity?.country?.languages) {
  //     setLanguages(campaignActivity?.country?.languages);
  //     console.log("languages", campaignActivity?.country?.languages);
  //   }
  // }, [campaignActivity]);

  const routeQuiz = () => {
    // window.location.href = "/map";
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/map${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  // const testFetchQuizData = async () => {
  //   try {
  //     const response = await fetch(
  //       // `/api/quiz?user_id=${session?.user.id}&activity_id=${activityId}&country_id=${country?.id}&job=${userJob}&lang_code=${selectedLanguage?.languageCode}`,
  //       `/api/activity/quiz?activity_id=${activityId}&&lang_code=ja`,
  //       {
  //         method: "GET",
  //         cache: "no-store",
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("fetchData data", data);
  //   } catch (error) {
  //     console.error("fetchData error", error);
  //   }
  // };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Intro</h1>
      {item && (
        <>
          <p>{item.activityId}</p>
          <p>{item.campaignId}</p>
          {/* <p>{item.}</p> */}
        </>
      )}

      <button onClick={routeQuiz} disabled={!selectedLanguage}>
        Go Map
      </button>

      {error && <div>{error.message}</div>}
    </div>
  );
}
