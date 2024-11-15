"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { useQuiz } from "@/providers/quiz_provider";
import {
  Campaign,
  CampaignActivity,
  Country,
  CountryLanguage,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type CountryEx = Country & {
  languages: CountryLanguage[];
};

type CampaignActivityEx = CampaignActivity & {
  campaign: Campaign;
  country: CountryEx;
};

export default function QuizMap() {
  const searchParams = useSearchParams();

  const activityId = searchParams.get("activityId");
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

  const {
    isLoading,
    error,
    item: campaignActivity,
  } = useGetItem<CampaignActivityEx>(`/api/campaign?activity_id=${activityId}`);

  const handleSelect = (countryLanguage: CountryLanguage) => {
    setSelectedLanguage(countryLanguage);
  };

  useEffect(() => {
    if (campaignActivity?.campaign) {
      setCampaign(campaignActivity?.campaign);
    }
    if (campaignActivity?.country) {
      setCountry(campaignActivity?.country);
    }
    if (campaignActivity?.country?.languages) {
      setLanguages(campaignActivity?.country?.languages);
      console.log("languages", campaignActivity?.country?.languages);
    }
  }, [campaignActivity]);

  const routeQuiz = () => {
    // window.location.href = "/map";
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/map${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  const testFetchQuizData = async () => {
    try {
      const response = await fetch(
        // `/api/quiz?user_id=${session?.user.id}&activity_id=${activityId}&country_id=${country?.id}&job=${userJob}&lang_code=${selectedLanguage?.languageCode}`,
        `/api/activity/quiz?activity_id=${activityId}&&lang_code=ja`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();
      console.log("fetchData data", data);
    } catch (error) {
      console.error("fetchData error", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Intro</h1>
      {campaignActivity && (
        <>
          <p>{campaignActivity?.countryCode}</p>
          <p>{campaignActivity.campaign.name}</p>
          <p>{campaignActivity.country.name}</p>
        </>
      )}
      {languages && (
        <>
          <ul>
            {languages.map((cl) => (
              <li
                key={cl.id}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedLanguage?.id === cl.id ? "lightblue" : "white",
                }}
                onClick={() => handleSelect(cl)}
              >
                cl.languageCode
              </li>
            ))}
          </ul>

          {selectedLanguage && (
            <div>
              <h2>Selected:</h2>
              <p>
                <strong>Language:</strong> {selectedLanguage.languageCode}
              </p>
            </div>
          )}
        </>
      )}

      <button onClick={routeQuiz} disabled={!selectedLanguage}>
        Go Map
      </button>

      <button onClick={testFetchQuizData} disabled={!selectedLanguage}>
        Fetch Quiz Data
      </button>
      {error && <div>{error.message}</div>}
    </div>
  );
}

// "use client";

// import useGetItem from "@/app/hooks/useGetItem";
// import { useQuiz } from "@/providers/quiz_provider";
// import { Campaign, CampaignActivity, Country } from "@prisma/client";
// import { useSearchParams } from "next/navigation";

// type CampaignActivityEx = CampaignActivity & {
//   campaign: Campaign;
//   country: Country;
// };

// // type QuizSetEx = QuizSet & {
// //   translations: QuizSetTranslation[];
// //   stages: Stage[];
// // };

// export default function QuizMap() {
//   const searchParams = useSearchParams();

//   const activityId = searchParams.get("activityId");
//   const userJob = searchParams.get("job");
//   const { country, selectedLanguage } = useQuiz();

//   console.log("useQuiz", country, selectedLanguage);

//   const { isLoading, error, item } = useGetItem<CampaignActivityEx>(
//     `/api/activity/quiz?activity_id=${activityId}&&lang_code=ja`
//   );

//   const routeQuiz = () => {
//     // window.location.href = "/quiz";
//     const currentUrl = new URL(window.location.href);
//     const queryString = currentUrl.search; // 현재 URL의 query string 추출
//     const targetUrl = `/quiz${queryString}`; // /quiz 뒤에 query string 추가
//     window.location.href = targetUrl;
//   };

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   console.log("item", item);

//   return (
//     <div>
//       <h1>Map</h1>
//       {/* {item && (
//         <>
//           <p>{item?.countryCode}</p>
//           <p>{item.campaign.name}</p>
//           <p>{item.country.name}</p>
//         </>
//       )} */}

//       <button onClick={routeQuiz}>Go Map</button>
//       {error && <div>{error.message}</div>}
//     </div>
//   );
// }
