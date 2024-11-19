"use client";

import useCreateItem from "@/app/hooks/useCreateItem";
import useGetItem from "@/app/hooks/useGetItem";
import {
  Campaign,
  CampaignDomainQuizSet,
  Language,
  UserCampaignDomainLog,
} from "@prisma/client";
import { Domain } from "domain";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// type CountryEx = Country & {
//   languages: CountryLanguage[];
// };

type CampaignDomainQuizSetEx = CampaignDomainQuizSet & {
  campaign: Campaign;
  domain: Domain;
  language: Language;
};

// type UserCampaignDomainLogEx = UserCampaignDomainLog & {
//   // campaignDomainQuizSet: CampaignDomainQuizSetEx;
// };

export default function QuizIntro() {
  const searchParams = useSearchParams();

  const activityId = searchParams.get("activityId");
  const jobName = searchParams.get("job");

  if (!activityId) {
    return <div>Activity ID is required</div>;
  }

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

  const {
    isLoading,
    error,
    item: history,
  } = useGetItem<UserCampaignDomainLog>(
    `/api/user/${session?.user.id}/activity/${activityId}/logs?job=${jobName}`
  );

  const {
    isLoading: isCreating,
    error: createError,
    item: createdHistory,
    createItem,
  } = useCreateItem<UserCampaignDomainLog>();

  const [userQuizHistory, setUserQuizHistory] =
    useState<UserCampaignDomainLog | null>(null);

  useEffect(() => {
    if (createdHistory) {
      setUserQuizHistory(createdHistory);
    }
  }, [createdHistory]);

  useEffect(() => {
    if (history) {
      setUserQuizHistory(history);
    }
  }, [history]);

  console.log("userQuizHistory", isLoading, error, history);

  const fetchLanguages = () => {
    //
  };

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
    createItem({
      url: `/api/user/${session?.user.id}/activity/${activityId}/logs`,
      body: { job: jobName },
    });
  };

  const routeQuizMap = () => {
    // const currentUrl = new URL(window.location.href);
    // const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/map?quizset_id=${userQuizHistory?.campaignDomainQuizSetId}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Intro (Sumtotal)</h1>
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
      <button onClick={routeQuizMap} disabled={userQuizHistory == null}>
        Go Quiz Map
      </button>
      {error && <div>{error.message}</div>}
    </div>
  );
}
