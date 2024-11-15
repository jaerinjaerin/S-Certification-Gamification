"use client";

import useGetItem from "@/app/hooks/useGetItem";
import {
  Campaign,
  CampaignActivity,
  Country,
  CountryLanguage,
  UserCampaignActivityLog,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type CountryEx = Country & {
  languages: CountryLanguage[];
};

type CampaignActivityEx = CampaignActivity & {
  campaign: Campaign;
  country: CountryEx;
};

export default function QuizIntro() {
  const searchParams = useSearchParams();

  const activityId = searchParams.get("activityId");
  // const userJob = searchParams.get("job");

  // const {
  //   campaign,
  //   country,
  //   setCampaign,
  //   setCountry,
  //   languages,
  //   setLanguages,
  //   selectedLanguage,
  //   setSelectedLanguage,
  // } = useQuiz();

  const { data: session } = useSession();

  // console.log("useQuiz", campaign, country, languages, selectedLanguage);

  const { isLoading, error, item } = useGetItem<UserCampaignActivityLog>(
    `/api/activity/${activityId}/user/${session?.user.id}/history`
  );

  const [userQuizHistory, setUserQuizHistory] =
    useState<UserCampaignActivityLog | null>(null);

  useEffect(() => {
    if (item) {
      setUserQuizHistory(item);
    }
  }, [item]);

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

  // const routeQuiz = () => {
  //   // window.location.href = "/map";
  //   const currentUrl = new URL(window.location.href);
  //   const queryString = currentUrl.search; // 현재 URL의 query string 추출
  //   const targetUrl = `/map${queryString}`; // /quiz 뒤에 query string 추가
  //   window.location.href = targetUrl;
  // };

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
  const createUserQuizHistory = async () => {
    try {
      const response = await fetch(
        `/api/activity/${activityId}/user/${session?.user.id}/history`,
        {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            languageCode: "ja",
          }),
        }
      );

      const data = await response.json();
      if (data) {
        // setUserQuizHistory(item);
      }
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
      {userQuizHistory && (
        <>
          <p>{userQuizHistory?.lastCompletedStage}</p>
        </>
      )}

      {/* <button onClick={routeQuiz} disabled={!selectedLanguage}>
        Go Map
      </button> */}

      <button
        onClick={createUserQuizHistory}
        disabled={userQuizHistory !== null}
      >
        Create User Quiz History
      </button>
      {error && <div>{error.message}</div>}
    </div>
  );
}
