"use client";

import { CampaignDomainQuizSetEx } from "@/app/types/type";
import { Campaign, Language, UserCampaignDomainLog } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface QuizContextType {
  quizSet: CampaignDomainQuizSetEx | null;
  campaign: Campaign | null;
  language: Language | null;
  quizHistory: UserCampaignDomainLog | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [quizSet, setQuizSet] = useState<CampaignDomainQuizSetEx | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [language, setLanguage] = useState<Language | null>(null);
  const [quizHistory, setQuizHistory] = useState<UserCampaignDomainLog | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const quizsetId = searchParams.get("quizset_id");
  const { data: session } = useSession();

  useEffect(() => {
    fetchDatas();
  }, []);

  const fetchDatas = async () => {
    await fetchQuizData();
    // if (session) {
    //   await fetchHistoryData();
    // }
  };

  const fetchQuizData = async () => {
    console.log("QuizProvider fetchData", quizsetId);
    try {
      setLoading(true);
      const response = await fetch(`/api/campaign/quiz_set/${quizsetId}`, {
        cache: "force-cache",
        // cache: "no-cache",
      });
      if (!response.ok) {
        routeCommonError(response.status);
        return;
      }
      const data = await response.json();

      console.log("QuizProvider fetchData data", data);
      setQuizSet(data.item);
      setCampaign(data.item.campaign);
      setLanguage(data.item.language);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async () => {
    console.log("QuizProvider fetchData", quizsetId);
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/${session?.user.id}/quiz_set/${quizsetId}`,
        {
          // cache: "force-cache",
          cache: "no-cache",
        }
      );
      if (!response.ok) {
        routeCommonError(response.status);
        return;
      }
      const data = await response.json();

      console.log("QuizProvider fetchData data", data);
      setQuizHistory(data.item);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const routeCommonError = (status: number) => {
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/error${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  const routeNotFound = () => {
    // window.location.href = "/map";
    const currentUrl = new URL(window.location.href);
    const queryString = currentUrl.search; // 현재 URL의 query string 추출
    const targetUrl = `/error/not-found${queryString}`; // /quiz 뒤에 query string 추가
    window.location.href = targetUrl;
  };

  if (loading) {
    return <div>Loading...</div>; // 로딩 화면
  }

  if (error) {
    return <div>{error}</div>; // 에러 메시지
  }

  // if (!quizSet || !campaign || !language) {
  //   routeNotFound();
  //   return;
  // }

  return (
    <QuizContext.Provider
      value={{
        quizSet,
        campaign,
        language,
        quizHistory,
        // loading,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz는 QuizProvider 내에서만 사용할 수 있습니다.");
  }
  return context;
};

// export function QuizProviderWrapper({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { loading } = useQuiz();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   return <>{children}</>;
// }
