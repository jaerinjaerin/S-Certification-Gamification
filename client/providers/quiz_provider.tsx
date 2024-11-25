"use client";

import { CampaignDomainQuizSetEx } from "@/app/types/type";
import { Language } from "@prisma/client";
import { createContext, useContext } from "react";

interface QuizContextType {
  quizSet: CampaignDomainQuizSetEx | null;
  language: Language | null;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider = ({
  children,
  quizSet,
  language,
}: {
  children: React.ReactNode;
  quizSet: CampaignDomainQuizSetEx;
  language: Language;
}) => {
  // const _quizSet = quizSet;
  // const _language = language;
  // const [quizSet, setQuizSet] = useState<CampaignDomainQuizSetEx>(_quizSet);
  // const [language, setLanguage] = useState<Language>(_language);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const searchParams = useSearchParams();
  // const { data: session } = useSession();
  // const pathname = usePathname(); // App Router에서 경로 가져오기
  // const paths = pathname.split("/").filter(Boolean);

  // const campaignName = paths[0];
  // const quizPath = paths[1];
  // console.log("QuizProvider pathname", pathname);

  // useEffect(() => {
  //   // fetchDatas();
  // }, []);

  // const fetchDatas = async () => {
  //   await fetchQuizData();
  //   // if (session) {
  //   //   await fetchHistoryData();
  //   // }
  // };

  // const fetchQuizData = async () => {
  //   console.log("QuizProvider fetchData", quizPath);
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`/api/campaign/quiz_set/${quizPath}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //       cache: "force-cache",
  //       // cache: "no-cache",
  //     });
  //     if (!response.ok) {
  //       routeCommonError(response.status);
  //       return;
  //     }
  //     const data = await response.json();

  //     console.log("QuizProvider fetchData data", data);
  //     setQuizSet(data.item);
  //     setLanguage(data.item.language);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const routeCommonError = (status: number) => {
  //   const currentUrl = new URL(window.location.href);
  //   const queryString = currentUrl.search; // 현재 URL의 query string 추출
  //   const targetUrl = `/error${queryString}`; // /quiz 뒤에 query string 추가
  //   window.location.href = targetUrl;
  // };

  // const routeNotFound = () => {
  //   // window.location.href = "/map";
  //   const currentUrl = new URL(window.location.href);
  //   const queryString = currentUrl.search; // 현재 URL의 query string 추출
  //   const targetUrl = `/error/not-found${queryString}`; // /quiz 뒤에 query string 추가
  //   window.location.href = targetUrl;
  // };

  // if (loading) {
  //   return <div>Loading...</div>; // 로딩 화면
  // }

  // if (error) {
  //   return <div>{error}</div>; // 에러 메시지
  // }

  // if (!quizSet || !campaign || !language) {
  //   routeNotFound();
  //   return;
  // }

  return (
    <QuizContext.Provider
      value={{
        quizSet,
        // campaign,
        language,
        // quizHistory,
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
