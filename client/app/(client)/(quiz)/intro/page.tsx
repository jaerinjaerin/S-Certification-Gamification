"use client";

import useGetItem from "@/app/hooks/useGetItem";
import { useQuiz } from "@/providers/quiz_provider";
import {
  Campaign,
  Country,
  CountryActivity,
  CountryLanguage,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

type CountryEx = Country & {
  languages: CountryLanguage[];
};

type CountryActivityEx = CountryActivity & {
  campaign: Campaign;
  country: CountryEx;
};

export default function QuizIntro() {
  const searchParams = useSearchParams();

  const activityId = searchParams.get("activityId");
  const userJob = searchParams.get("job");

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

  const { isLoading, error, item } = useGetItem<CountryActivityEx>(
    `/api/campaign?activity_id=${activityId}`
  );

  const handleSelect = (countryLanguage: CountryLanguage) => {
    setSelectedLanguage(countryLanguage);
  };

  useEffect(() => {
    if (item?.campaign) {
      setCampaign(item?.campaign);
    }
    if (item?.country) {
      setCountry(item?.country);
    }
    if (item?.country?.languages) {
      setLanguages(item?.country?.languages);
      console.log("languages", item?.country?.languages);
    }
  }, [item]);

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
        `/api/quiz?user_id=${session?.user.id}&activity_id=${activityId}&country_id=${country?.id}&job=${userJob}&lang_code=ja`,
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
      {item && (
        <>
          <p>{item?.countryCode}</p>
          <p>{item.campaign.name}</p>
          <p>{item.country.name}</p>
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
